<template>
    <div id="manager" v-if="proxy.isAuth(['ROOT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="username">
                <el-input v-model="formData.username" placeholder="用户名" maxlength="50" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item>
                <el-select v-model="formData.organizationId" placeholder="所属机构" class="search-input"
                           clearable="clearable" filterable>
                    <el-option v-for="item in formData.organizationList" :key="item.value" :label="item.label"
                               :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['ROOT'])" @click="showDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['ROOT'])" @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.statusLabel" @change="searchByCondition()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="正常">正常</el-radio-button>
                    <el-radio-button value="冻结">冻结</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList" :header-cell-style="{'background':'#f5f7fa','padding':'10px 0 !important'}"
                  v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange" border>
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"
                             fixed/>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="username" header-align="center" align="center" label="用户名" min-width="250"
                             show-overflow-tooltip/>
            <el-table-column prop="organizationName" header-align="center" align="center" label="所属机构"
                             min-width="300" show-overflow-tooltip/>
            <el-table-column prop="tel" header-align="center" align="center" label="手机号码" min-width="180"/>
            <el-table-column prop="email" header-align="center" align="center" label="电子邮箱" min-width="300"
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
        <el-dialog :title="dialog.formData.id? '编辑机构管理员' : '新增机构管理员'" v-model="dialog.visible" width="450"
                   :close-on-click-modal="false" v-if="proxy.isAuth(['ROOT'])">
            <el-form ref="dialogForm" :model="dialog.formData" :rules="dialog.rule" label-width="80px">
                <el-form-item label="用户名" prop="username" v-if="!dialog.formData.id">
                    <el-input v-model="dialog.formData.username" placeholder="用户名" maxlength="50"/>
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!dialog.formData.id">
                    <el-input v-model="dialog.formData.password" type="password" placeholder="密码" maxlength="20"/>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword" v-if="!dialog.formData.id">
                    <el-input v-model="dialog.formData.confirmPassword" type="password" placeholder="重复输入密码"
                              maxlength="20"/>
                </el-form-item>
                <el-form-item label="手机号码" prop="tel">
                    <el-input v-model="dialog.formData.tel" placeholder="手机号码" maxlength="20"/>
                </el-form-item>
                <el-form-item label="电子信箱" prop="email">
                    <el-input v-model="dialog.formData.email" placeholder="电子信箱" maxlength="20"/>
                </el-form-item>
                <el-form-item label="所属机构" prop="organizationId">
                    <el-select v-model="dialog.formData.organizationId" placeholder="所属机构" clearable="clearable"
                               filterable>
                        <el-option v-for="item in formData.organizationList" :key="item.value" :label="item.label"
                                   :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="用户状态" prop="status">
                    <el-radio-group v-model="dialog.formData.status">
                        <el-radio value="正常">正常</el-radio>
                        <el-radio value="冻结">冻结</el-radio>
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
    username: null,
    organizationId: null,
    organizationList: [],
    status: null,
    statusLabel: '全部'
});

const rule = reactive({
    username: [
        {pattern: '^[a-zA-Z0-9]{1,50}$', message: '用户名格式错误', trigger: 'blur'}
    ],
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
        username: null,
        password: null,
        confirmPassword: null,
        tel: null,
        email: null,
        organizationId: null,
        status: "正常"
    },
    rule: {
        username: [
            {required: true, message: "请输入用户名"},
            {min: 5, max: 50, message: '长度在5到50个字符之间', trigger: 'blur'},
            {pattern: '^[a-zA-Z0-9]{5,50}\$', message: '用户名格式错误', trigger: 'blur'},
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        username: value
                    }
                    proxy.$http("/mis/user/check-username-conflict", "POST", data, true, resp => {
                        let result = resp.result;
                        if (result.status == "SUCCESS") {
                            if (result.isConflict === false) {
                                callback();
                            }
                            else {
                                callback(new Error('用户名已存在'));
                            }
                        }
                    })
                },
                trigger: 'blur'
            }
        ],
        password: [
            {required: true, message: "请输入密码"},
            {min: 6, max: 20, message: '长度在6到20个字符之间', trigger: 'blur'},
            {pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误', trigger: 'blur'}
        ],
        confirmPassword: [
            {required: true, message: "请重复输入密码"},
            {min: 6, max: 20, message: '长度在6到20个字符之间', trigger: 'blur'},
            {pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误', trigger: 'blur'},
            {
                validator: (rule, value, callback) => {
                    if (value !== dialog.formData.password) {
                        callback(new Error('两次输入密码不一致'));
                    }
                    else {
                        callback();
                    }
                }, trigger: 'blur'
            }
        ],
        tel: [
            {required: true, message: "请输入手机号码"},
            {pattern: '^1[34578]\\d{9}$', message: '手机号码格式错误', trigger: 'blur'},
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        tel: value
                    }
                    proxy.$http("/mis/user/check-tel-conflict", "POST", data, true, resp => {
                        let result = resp.result;
                        if (result.status == "SUCCESS") {
                            if (result.isConflict === false) {
                                callback();
                            }
                            else {
                                callback(new Error('手机号码已存在'));
                            }
                        }
                    })
                },
                trigger: 'blur'
            }
        ],
        email: [
            {required: true, message: "请输入电子邮箱"},
            {
                pattern: '^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$',
                message: '电子邮箱格式错误',
                trigger: 'blur'
            }
        ],
        organizationId: [
            {required: true, message: '请选择所属机构'}
        ]
    }

});

/** 函数定义区域 *********************************************************/

function loadOrganizationList() {
    proxy.$http("/mis/organization/search-organization-list", "GET", null, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            formData.organizationList = []
            for (let one of result.organizationList) {
                formData.organizationList.push({label: one.name, value: one.id})
            }
        }

    })
}

loadOrganizationList();

function loadTableData() {
    tableData.loading = true;
    let temp = {
        "全部": null,
        "正常": 1,
        "冻结": 2
    }
    formData.status = temp[formData.statusLabel];
    const data = {
        username: formData.username,
        organizationId: formData.organizationId,
        status: formData.status,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/user/search-manager-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            let temp = {
                "1": "正常",
                "2": "冻结",
                "3": "离职"
            }
            for (let one of page.list) {
                one.status = temp[one.status]
            }
            tableData.dataList = page.list;
            tableData.totalCount = Number(page.totalCount);
            tableData.loading = false;
        }
    })
}

loadTableData();

function searchByCondition() {
    proxy.$refs.form.validate((valid) => {
        if (valid) {
            tableData.pageIndex = 1;
            loadTableData();
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

function selectable(row, index) {
    if (row.status !== "正常") {
        return true;
    }
    return false;
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
            proxy.$http("/mis/user/search-manager-by-id", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    const temp = {
                        "1": "正常",
                        "2": "冻结"
                    }
                    result.manager.status = temp[result.manager.status];
                    dialog.formData.username = result.manager.username;
                    dialog.formData.tel = result.manager.tel;
                    dialog.formData.email = result.manager.email;
                    dialog.formData.organizationId = result.manager.organizationId;
                    dialog.formData.status = result.manager.status;
                }
            })
        }
    })


}

function saveSubmit() {
    proxy.$refs.dialogForm.validate((valid) => {
        if (valid) {
            let temp = {
                "正常": 1,
                "冻结": 2
            }
            const data = {
                id: dialog.formData.id,
                username: dialog.formData.username,
                password: dialog.formData.password,
                tel: dialog.formData.tel,
                email: dialog.formData.email,
                organizationId: dialog.formData.organizationId,
                status: temp[dialog.formData.status]
            }

            let url = null
            if (dialog.formData.id) {
                url = "/mis/user/update-manager"
            }
            else {
                url = "/mis/user/insert-manager"
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
        proxy.$http("/mis/user/delete-manager-by-ids", "POST", data, true, resp => {
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
                    message: "删除失败",
                    duration: 1200
                })
            }
        })
    })
}
</script>

<style scoped lang="scss">

</style>