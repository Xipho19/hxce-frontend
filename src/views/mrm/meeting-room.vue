<template>
    <div id="meetingRoom">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="会议室名称" maxlength="50" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.statusLabel" @change="searchByCondition()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="正常">开放</el-radio-button>
                    <el-radio-button value="停用">停用</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['ROOT','MEETING_ROOM:INSERT'])"
                           @click="showDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['ROOT','MEETING_ROOM:DELETE'])"
                           @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList" :header-cell-style="{'background':'#f5f7fa','padding':'10px 0 !important'}"
                  v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange" border>
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"/>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="会议室名称" min-width="250"
                             show-overflow-tooltip/>
            <el-table-column prop="max" header-align="center" align="center" label="人数上限"
                             min-width="150" show-overflow-tooltip/>
            <el-table-column prop="desc" header-align="center" align="left" label="简介信息" min-width="300"/>
            <el-table-column prop="remark" header-align="center" align="left" label="备注信息" min-width="300"
                             show-overflow-tooltip/>
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="150"/>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT'])" @click="showDialog(scope.row.id)"
                               link>
                        修改
                    </el-button>
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT'])||scope.row.status=='正常'"
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
        <el-dialog :title="dialog.formData.id? '编辑会议室' : '新增会议室'" v-model="dialog.visible" width="450"
                   :close-on-click-modal="false"
                   v-if="proxy.isAuth(['ROOT','MEETING_ROOM:INSERT','MEETING_ROOM:UPDATE'])">
            <el-form ref="dialogForm" :model="dialog.formData" :rules="dialog.rule" label-width="80px">
                <el-form-item label="房间名称" prop="name">
                    <el-input v-model="dialog.formData.name" placeholder="会议室名称" maxlength="50"/>
                </el-form-item>
                <el-form-item label="人数上限" prop="max">
                    <el-input v-model="dialog.formData.max" placeholder="人数上限" maxlength="6"/>
                </el-form-item>
                <el-form-item label="简介信息">
                    <el-input type="textarea" v-model="dialog.formData.desc" placeholder="简介信息" maxlength="200"
                              rows="4"/>
                </el-form-item>
                <el-form-item label="备注信息">
                    <el-input type="textarea" v-model="dialog.formData.remark" placeholder="备注信息" maxlength="200"
                              rows="4"/>
                </el-form-item>
                <el-form-item label="状态信息" prop="status">
                    <el-radio-group v-model="dialog.formData.status">
                        <el-radio-button value="1">开放</el-radio-button>
                        <el-radio-button value="2">停用</el-radio-button>
                    </el-radio-group>
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

const {proxy} = getCurrentInstance();
/** 响应对象区域 *********************************************************/
const formData = reactive({
    name: null,
    statusLabel: '全部'
});

const rule = reactive({
    name: [
        {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{1,50}$', message: '会议室名称格式错误', trigger: 'blur'}
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
        name: null,
        max: null,
        desc: null,
        remark: null,
        status: "1"
    },
    rule: {
        name: [
            {required: true, message: "请输入会议室名称"},
            {min: 2, max: 50, message: '长度在2到50个字符之间'},
            {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{2,50}$', message: '会议室名称格式错误', trigger: 'blur'},
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        name: value
                    }

                    proxy.$http("/mis/meeting/room/check-name-conflict", "POST", data, true, resp => {
                        let result = resp.result;
                        if (result.status == "SUCCESS") {
                            if (result.isConflict === false) {
                                callback();
                            }
                            else {
                                callback(new Error('会议室名称已存在'));
                            }
                        }
                    })
                },
                trigger: 'blur'
            }
        ],
        max: [
            {required: true, message: "请输入人数上限"},
            {
                pattern: '^[1-9]\\d{0,5}$',
                message: '数字格式错误',
                trigger: 'blur'
            }
        ],
        status: [
            {required: true, message: "请输选择状态"}
        ]
    }
});

/** 函数定义区域 *********************************************************/
function loadTableData() {
    tableData.loading = true;
    tableData.expands = [];
    let temp = {
        "全部": null,
        "开放": 1,
        "停用": 2
    }
    const data = {
        name: formData.name,
        status: temp[formData.statusLabel],
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/meeting/room/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            let statusJson = {
                "1": "开放",
                "2": "停用"
            }
            page.list.forEach(one => {
                one.status = statusJson[one.status]
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

function searchByCondition() {
    proxy.$refs.form.validate((valid) => {
        if (valid) {
            tableData.pageIndex = 1;
            loadTableData();
        }
    })
}

function selectable(row, index) {
    if (row.hasRecord == true) {
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
            proxy.$http("/mis/meeting/room/search-by-id", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    dialog.formData.name = result.meetingRoom.name;
                    dialog.formData.max = result.meetingRoom.max;
                    dialog.formData.desc = result.meetingRoom.desc;
                    dialog.formData.remark = result.meetingRoom.remark;
                    dialog.formData.status = result.meetingRoom.status + "";
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
                name: dialog.formData.name,
                max: dialog.formData.max,
                desc: dialog.formData.desc,
                remark: dialog.formData.remark,
                status: dialog.formData.status
            }

            let url = null
            if (dialog.formData.id) {
                url = "/mis/meeting/room/update"
            }
            else {
                url = "/mis/meeting/room/insert"
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
        proxy.$http("/mis/meeting/room/delete-by-ids", "POST", data, true, resp => {
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