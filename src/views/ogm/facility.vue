<template>
    <div id="dept" v-if="proxy.isAuth(['FACILITY:SELECT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="设施名称" maxlength="50" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item prop="author">
                <el-input v-model="formData.author" placeholder="上传人" maxlength="20" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item prop="sortSeq">
                <el-input v-model="formData.sortSeq" placeholder="优先级别" maxlength="2" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['FACILITY:INSERT'])"
                           @click="showDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['FACILITY:DELETE'])"
                           @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList" :header-cell-style="{'background':'#f5f7fa','padding':'10px 0 !important'}"
                  v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange"
                  @sort-change="sortChange" border>
            <el-table-column type="selection" header-align="center" align="center" width="50"/>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="设施名称" min-width="200"
                             show-overflow-tooltip/>
            <el-table-column header-align="center" align="center" label="图片" min-width="150"
                             show-overflow-tooltip>
                <template #default="scope">
                    <el-link type="primary" :underline="false" target="_blank" :href="scope.row.image">查看图片
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column prop="author" header-align="center" align="center" label="上传人" min-width="180"/>
            <el-table-column prop="sortSeq" header-align="center" align="center" label="优先级别" min-width="150"
                             sortable/>
            <el-table-column prop="createTime" header-align="center" align="center" label="上传时间" min-width="150"
                             sortable>
                <template #default="scope">
                    <span>{{ dayjs(scope.row.createTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" header-align="center" align="center" label="修改时间" min-width="150"
                             sortable>
                <template #default="scope">
                    <span>{{ dayjs(scope.row.updateTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['DEPT:UPDATE'])"
                               @click="showDialog(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary" :disabled="!proxy.isAuth(['DEPT:DELETE'])||scope.row.userCount>0"
                               @click="deleteTableRows(scope.row.id)" link>
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="pageSizeChange" @current-change="pageIndexChange"
                       :current-page="tableData.pageIndex" :page-sizes="[10, 20, 50]" :page-size="tableData.pageSize"
                       :total="tableData.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
        <el-dialog :title="dialog.formData.id? '编辑设施' : '新增设施'" v-model="dialog.visible" width="450"
                   :close-on-click-modal="false" v-if="proxy.isAuth(['FACILITY:INSERT','FACILITY:UPDATE'])"
                   @closed="dialogClosed">
            <el-form ref="dialogForm" :model="dialog.formData" :rules="dialog.rule" label-width="80px">
                <el-form-item label="设施名称" prop="name">
                    <el-input v-model="dialog.formData.name" placeholder="设施名称" maxlength="50"/>
                </el-form-item>
                <el-form-item label="优先级别" prop="sortSeq">
                    <el-slider v-model="dialog.formData.sortSeq"/>
                </el-form-item>
                <el-form-item label="上传图片" prop="imageList">
                    <el-upload ref="imageUploader" accept=".jpg,.jpeg" :action="dialog.url"
                               v-model:file-list="dialog.formData.imageList" list-type="picture-card"
                               :limit="1" :on-exceed="updateImageExceed" :auto-upload="false"
                               :headers="{'token':token}" name="file"
                               :data="{'id':dialog.formData.id,'name':dialog.formData.name,'sortSeq':dialog.formData.sortSeq}"
                               :before-upload="beforeUploadImage" :on-success="uploadImageSuccess"
                               :on-error="uploadImageError">
                        <el-icon>
                            <Plus/>
                        </el-icon>
                        <template #file="{ file }">
                            <div>
                                <img class="el-upload-list__item-thumbnail" :src="file.url" alt=""/>
                                <span class="el-upload-list__item-actions">
                                    <span v-if="!disabled" class="el-upload-list__item-delete" @click="removeImage">
                                        <el-icon><Delete/></el-icon>
                                    </span>
                                </span>
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">取消</el-button>
                <el-button type="primary" @click="saveSubmit()">保存</el-button>
            </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {reactive, getCurrentInstance, ref, inject} from 'vue';
import {useRouter} from 'vue-router';
import {Search, Plus, Delete} from "@element-plus/icons-vue";
import {dayjs, genFileId} from "element-plus";

const router = useRouter();
const {proxy} = getCurrentInstance();

/** 响应对象区域 *********************************************************/

const formData = reactive({
    name: null,
    author: null,
    sortSeq: null,
});

const rule = reactive({
    name: [
        {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{1,50}$', message: '设施名称格式不正确', trigger: 'blur'}
    ],
    author: [
        {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{1,20}$', message: '上传人不正确', trigger: 'blur'}
    ],
    sortSeq: [
        {pattern: '^(100|[1-9]?[0-9])$', message: '优先级别范围必须在0-100之间', trigger: 'blur'}
    ],
})

const tableData = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: [],
    sortProp: null,
    sortOrder: null
});

const dialog = reactive({
    visible: false,
    url: null,
    formData: {
        id: null,
        name: null,
        sortSeq: 10,
        imageList: []
    },
    rule: {
        name: [
            {required: true, message: "请输入设施名称"},
            {min: 2, max: 50, message: '长度在2到50个字符之间'},
            {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{2,50}$', message: '设施名称格式错误', trigger: 'blur'}
        ],
        sortSeq: [
            {required: true, message: "请设置优先级"},
        ],
        imageList: [
            {required: true, message: "请上传图片"},
        ]
    }
});

const token = ref(localStorage.getItem('token'))

/** 函数定义区域 *********************************************************/

function loadTableData() {
    tableData.loading = true;
    const data = {
        name: formData.name,
        author: formData.author,
        sortSeq: formData.sortSeq,
        page: tableData.pageIndex,
        length: tableData.pageSize,
        sortProp: tableData.sortProp,
        sortOrder: tableData.sortOrder
    }

    proxy.$http("/mis/facility/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            let list = page.list;
            list.forEach(one => {
                one.image = proxy.$minioUrl + "/" + one.image;
            });
            tableData.dataList = page.list;
            tableData.totalCount = Number(page.totalCount);
            tableData.loading = false;
        }
    })
}

loadTableData();

function pageSizeChange(size) {
    tableData.pageSize = size;
    tableData.pageIndex = 1;
    loadTableData();
}

function pageIndexChange(index) {
    tableData.pageIndex = index;
    loadTableData();
}


function selectionChange(selection) {
    tableData.selections = selection;
}

function searchByCondition() {
    proxy.$refs.form.validate((valid) => {
        if (valid) {
            tableData.pageIndex = 1;
            loadTableData();
        }
    })
}

function showDialog(id) {
    dialog.formData.id = (id) ? id : null;
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.dialogForm.resetFields();
        if (id) {
            const data = {
                id: id
            }
            proxy.$http("/mis/facility/search-by-id", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    dialog.formData.name = result.facility.name;
                    dialog.formData.sortSeq = Number(result.facility.sortSeq);
                    dialog.formData.imageList = [{url: proxy.$minioUrl + "/" + result.facility.image}];
                }
            })
        }
    })
}

function dialogClosed() {
    dialog.formData.imageList = [];
}

function updateImageExceed(files) {
    let uploader = proxy.$refs.imageUploader;
    uploader.clearFiles();
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    //只能上传一张照片，替换掉原来的照片
    uploader.handleStart(file)
}

function beforeUploadImage(file: UploadFile) {
    if (file.size > 2 * 1024 * 1024) {
        proxy.$message({
            type: 'error',
            message: '照片文件不能超过2M',
            duration: 1200
        })
        return false
    }
    return true
}

function removeImage() {
    dialog.formData.imageList = []
}

function saveSubmit() {
    proxy.$refs.dialogForm.validate((valid) => {
        if (valid) {
            if (dialog.formData.imageList.length === 0) {
                proxy.$message({
                    type: 'error',
                    message: '请选择设施图片',
                    duration: 1200
                })
            }
            else {
                if (dialog.formData.id) {
                    //修改设施

                    let status = dialog.formData.imageList[0].status
                    if (status == "ready") {
                        //需要上传图片
                        dialog.url = proxy.$baseUrl + "/mis/facility/update-with-image"
                        let uploader = proxy.$refs.imageUploader;
                        uploader.submit();
                    }
                    else if (status == "success") {
                        //不需要上传图片
                        let data = {
                            id: dialog.formData.id,
                            name: dialog.formData.name,
                            sortSeq: dialog.formData.sortSeq,
                        }
                        proxy.$http("/mis/facility/update-without-image", "POST", data, true, resp => {
                            let result = resp.result;
                            if (result.status == "SUCCESS") {
                                proxy.$message({
                                    type: 'success',
                                    message: '执行成功',
                                    duration: 1200,
                                    onClose: () => {
                                        dialog.visible = false;
                                        loadTableData()
                                    }
                                })
                            }
                        })

                    }
                }
                else {
                    //新增设施
                    dialog.url = proxy.$baseUrl + "/mis/facility/insert"
                    let uploader = proxy.$refs.imageUploader;
                    uploader.submit();
                }

            }
        }
    });

}

function uploadImageSuccess(resp: any, file: UploadFile, fileList: UploadFile[]) {
    if (resp.code === "200" && resp.result.status === "SUCCESS") {
        proxy.$message({
            type: 'success',
            message: '执行成功',
            duration: 1200,
            onClose: () => {
                dialog.visible = false;
                loadTableData()
            }
        })
    }
    else {
        proxy.$message({
            type: 'error',
            message: '执行失败',
            duration: 1200,
            onClose: () => {
                dialog.visible = false;
            }
        })
    }
}

function uploadImageError(error: any, file: UploadFile, fileList: UploadFile[]) {
    proxy.$message({
        type: 'error',
        message: '执行失败',
        duration: 1200,
        onClose: () => {
            dialog.visible = false;
        }
    })
}

function deleteTableRows(id) {
    let ids = id ? [id] : tableData.selections.map(one => one.id);
    if (ids.length === 0) {
        proxy.$message({
            type: 'warning',
            message: '请选择要删除的记录',
            duration: 1200
        })
        return
    }
    proxy.$confirm('确认删除选中的记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const data = {
            "ids": ids
        }
        proxy.$http("/mis/facility/delete-by-ids", "POST", data, true, resp => {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                proxy.$message({
                    message: '删除成功',
                    type: 'success',
                    duration: 1200,
                    onClose: () => {
                        loadTableData();
                    }
                });
            }
            else {
                proxy.$message({
                    type: 'error',
                    message: '删除失败',
                    duration: 1200
                })
            }
        })
    })
}


function sortChange(obj) {
    let prop = obj.prop;
    let order = obj.order;

    let json = {
        "sortSeq": "sort_seq",
        "createTime": "create_time",
        "updateTime": "update_time"
    }
    tableData.sortProp = json[prop];

    json = {
        "ascending": "ASC",
        "descending": "DESC",
        "null": null
    }
    tableData.sortOrder = json[order];

    tableData.pageIndex = 1;
    loadTableData();


}
</script>


<style scoped lang="scss">

</style>