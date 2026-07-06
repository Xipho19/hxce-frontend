<template>
    <div class="amectType">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="type">
                <el-input v-model="formData.type" placeholder="罚款类型" maxlength="50" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['ROOT','DEPT:INSERT'])"
                           @click="showDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['ROOT','DEPT:DELETE'])"
                           @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList" :header-cell-style="{'background':'#f5f7fa','padding':'10px 0 !important'}"
                  v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange" border>
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"/>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="type" header-align="center" align="center" label="罚款类型" min-width="250"
                             show-overflow-tooltip/>
            <el-table-column prop="amount" header-align="center" align="center" label="建议罚款金额"
                             min-width="200" show-overflow-tooltip>
                <template #default="scope">
                    <span>{{ scope.row.amount }}元</span>
                </template>
            </el-table-column>
            <el-table-column prop="amount" header-align="center" align="center" label="本年罚款次数" min-width="250"
                             show-overflow-tooltip>
                <template #default="scope">
                    <span>{{ scope.row.yearCount }}次</span>
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" label="未缴纳人数" min-width="250"
                             show-overflow-tooltip>
                <template #default="scope">
                    <span>{{ scope.row.unpaidCount }}人</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT','DEPT:UPDATE'])"
                               @click="showDialog(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary"
                               :disabled="!proxy.isAuth(['ROOT','AMECT_TYPE:DELETE'])||scope.row.totalCount>0"
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
        <el-dialog :title="dialog.formData.id? '编辑罚款类型' : '新增罚款类型'" v-model="dialog.visible" width="450"
                   :close-on-click-modal="false" v-if="proxy.isAuth(['ROOT','AMECT_TYPE:INSERT','AMECT_TYPE:UPDATE'])">
            <el-form ref="dialogForm" :model="dialog.formData" :rules="dialog.rule" label-width="80px">
                <el-form-item label="罚款类型" prop="type">
                    <el-input v-model="dialog.formData.type" placeholder="罚款类型" maxlength="50"/>
                </el-form-item>
                <el-form-item label="建议金额" prop="amount">
                    <el-input v-model="dialog.formData.amount" placeholder="建议金额" maxlength="20"/>
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
import {reactive, getCurrentInstance, ref} from 'vue';
import {Search, Plus, Delete} from "@element-plus/icons-vue";
import {isAmount} from "@/utils/validate";

const {proxy} = getCurrentInstance();

/** 响应对象区域 *********************************************************/
const formData = reactive({
    type: null,
});

const rule = reactive({
    type: [
        {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{1,50}$', message: '罚款类型格式错误', trigger: 'blur'}
    ]
})

const tableData = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: []
});

const dialog = reactive({
    visible: false,
    formData: {
        id: null,
        type: null,
        amount: null
    },
    rule: {
        type: [
            {required: true, message: "请输入罚款类型", trigger: "blur"},
            {min: 2, max: 50, message: '长度在2到50个字符之间'},
            {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{2,50}$', message: '罚款类型格式错误', trigger: 'blur'},
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        type: value
                    }
                    proxy.$http("/mis/amect/type/check-type-conflict", "POST", data, true, resp => {
                        let result = resp.result;
                        if (result.status == "SUCCESS") {
                            if (result.isConflict === false) {
                                callback();
                            }
                            else {
                                callback(new Error('罚款类型已存在'));
                            }
                        }
                    })
                },
                trigger: 'blur'
            }
        ],
        amount: [
            {required: true, message: "请输入建议罚款金额", trigger: "blur"},
            {
                validator: (rule, value, callback) => {
                    if (isAmount(value)) {
                        callback();
                    }
                    else {
                        callback(new Error("金额格式不正确"))
                    }
                }, trigger: "blur"
            }
        ]
    }
});

/** 函数定义区域 *********************************************************/
function loadTableData() {
    tableData.loading = true;
    const data = {
        type: formData.type,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/amect/type/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            tableData.dataList = page.list;
            tableData.totalCount = Number(page.totalCount);
            tableData.loading = false;
        }
    })
}

function pageSizeChange(size) {
    tableData.pageSize = size;
    tableData.pageIndex = 1;
    loadTableData();
}

function pageIndexChange(index) {
    tableData.pageIndex = index;
    loadTableData();
}

function searchByCondition() {
    proxy.$refs.form.validate((valid) => {
        if (valid) {
            tableData.pageIndex = 1;
            loadTableData();
        }
    })
}

loadTableData();

function selectable(row, index) {
    if (row.totalCount > 0) {
        return false;
    }
    return true;
}

function selectionChange(selection) {
    tableData.selections = selection;
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
            proxy.$http("/mis/amect/type/search-by-id", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    dialog.formData.type = result.amectType.type;
                    dialog.formData.amount = result.amectType.amount;
                }
            })
        }
    })
}

function saveSubmit() {
    proxy.$refs.dialogForm.validate((valid) => {
        if (valid) {
            const data = {
                id: dialog.formData.id,
                type: dialog.formData.type,
                amount: dialog.formData.amount
            }

            let url = null
            if (dialog.formData.id) {
                url = "/mis/amect/type/update"
            }
            else {
                url = "/mis/amect/type/insert"
            }

            proxy.$http(url, "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    proxy.$message({
                        type: 'success',
                        message: '保存成功',
                        duration: 1200,
                        onClose: () => {
                            dialog.visible = false;
                            loadTableData();
                        }
                    });
                }
            })
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
        proxy.$http("/mis/amect/type/delete-by-ids", "POST", data, true, resp => {
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
</script>
<style scoped lang="scss">

</style>