<template>
    <div id="dept" v-if="proxy.isAuth(['ROOT','DEPT:SELECT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="部门名称" maxlength="50" class="search-input"
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
                  v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange"
                  @expand-change="expand" :row-key="tableData.getRowKeys" :expand-row-keys="tableData.expands" border>
            <el-table-column type="expand">
                <template #default="scope">
                    <div class="user-list-container">
                        <ul class="user-list" v-if="scope.row.userList && scope.row.userList.length>0">
                            <li v-for="one in scope.row.userList" :key="one.id">
                                <el-tooltip effect="dark" :content="one.name" placement="top-start"
                                            v-if="one.name.length>3">
                                    <div class="user-item">
                                        <div class="user-avatar">
                                            <el-avatar shape="square" :size="45" :src="one.photo">
                                                <img src="../../assets/ogm/pic.png" alt="用户头像"/>
                                            </el-avatar>
                                        </div>
                                        <el-text class="user-name" truncated>{{ one.name }}</el-text>
                                    </div>
                                </el-tooltip>
                                <div class="user-item" v-else>
                                    <div class="user-avatar">
                                        <el-avatar shape="square" :size="45" :src="one.photo">
                                            <img src="../../assets/ogm/pic.png" alt="用户头像"/>
                                        </el-avatar>
                                    </div>
                                    <el-text class="user-name" truncated>{{ one.name }}</el-text>
                                </div>
                            </li>
                        </ul>
                        <el-empty :image-size="50" description="暂无在职用户" class="empty" v-else/>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"/>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="部门名称" min-width="250"
                             show-overflow-tooltip/>
            <el-table-column prop="tel" header-align="center" align="center" label="部门电话"
                             min-width="200" show-overflow-tooltip/>
            <el-table-column prop="email" header-align="center" align="center" label="部门邮箱" min-width="300"
                             show-overflow-tooltip/>
            <el-table-column header-align="center" align="center" label="用户数量" min-width="200"
                             show-overflow-tooltip>
                <template #default="scope">
                    <span>{{ scope.row.userCount }}人</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT','DEPT:UPDATE'])"
                               @click="showDialog(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT','DEPT:DELETE'])||scope.row.userCount>0"
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
        <el-dialog :title="dialog.formData.id? '编辑部门' : '新增部门'" v-model="dialog.visible" width="450"
                   :close-on-click-modal="false" v-if="proxy.isAuth(['ROOT','DEPT:INSERT','DEPT:UPDATE'])">
            <el-form ref="dialogForm" :model="dialog.formData" :rules="dialog.rule" label-width="80px">
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="dialog.formData.name" placeholder="部门名称" maxlength="50"/>
                </el-form-item>
                <el-form-item label="部门电话" prop="tel">
                    <el-input v-model="dialog.formData.tel" placeholder="部门电话" maxlength="20"/>
                </el-form-item>
                <el-form-item label="部门邮箱" prop="email">
                    <el-input v-model="dialog.formData.email" placeholder="部门邮箱" maxlength="200"/>
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
});

const rule = reactive({
    name: [
        {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{1,50}$', message: '部门名称格式错误', trigger: 'blur'}
    ]
})

const tableData = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: [],
    expands: [],
    getRowKeys(row) {
        return row.id;
    }
});

const dialog = reactive({
    visible: false,
    formData: {
        id: null,
        name: null,
        tel: null,
        email: null
    },
    rule: {
        name: [
            {required: true, message: "请输入部门名称", trigger: "blur"},
            {min: 2, max: 50, message: '长度在2到50个字符之间'},
            {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{2,50}$', message: '部门名称格式错误', trigger: "blur"},
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        name: value
                    }
                    proxy.$http("/mis/dept/check-name-conflict", "POST", data, true, resp => {
                        let result = resp.result;
                        if (result.status == "SUCCESS") {
                            if (result.isConflict === false) {
                                callback();
                            }
                            else {
                                callback(new Error('部门名称已存在'));
                            }
                        }
                    })
                },
                trigger: 'blur'
            }
        ],
        tel: [
            {
                pattern: '^1[34578]\\d{9}$|^((0[1-9][0-9]{0,2})[-]?)?([1-9][0-9]{6,7})$',
                message: '电话号码格式错误',
                trigger: 'blur'
            }
        ],
        email: [
            {
                pattern: '^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$',
                message: '电子邮箱格式错误',
                trigger: 'blur'
            }
        ]
    }
});

/** 函数定义区域 *********************************************************/
function loadTableData() {
    tableData.loading = true;
    tableData.expands = [];
    const data = {
        name: formData.name,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/dept/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
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
    if (row.userCount > 0) {
        return false;
    }
    return true;
}

function selectionChange(selection) {
    tableData.selections = selection;
}

function expand(row, expandedRows) {
    if (expandedRows.length > 0) {
        tableData.expands = [];
        let data = {
            deptId: row.id,
            statuses: [1, 2]
        };
        proxy.$http('/mis/user/search-user-associated-dept', 'POST', data, false, function (resp) {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                result.userList.forEach(one => {
                    if (one.photo) {
                        one.photo = one.photo ? proxy.$minioUrl + one.photo : "../../assets/ogm/pic.png"
                    }
                });
                row.userList = result.userList;
                tableData.expands.push(row.id);
            }
        });
    }
    else {
        tableData.expands = [];
    }
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
            proxy.$http("/mis/dept/search-by-id", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    dialog.formData.name = result.dept.name;
                    dialog.formData.tel = result.dept.tel;
                    dialog.formData.email = result.dept.email;
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
                tel: dialog.formData.tel,
                email: dialog.formData.email
            }

            let url = null
            if (dialog.formData.id) {
                url = "/mis/dept/update"
            }
            else {
                url = "/mis/dept/insert"
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
        proxy.$http("/mis/dept/delete-by-ids", "POST", data, true, resp => {
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