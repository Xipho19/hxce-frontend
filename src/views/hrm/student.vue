<template>
    <div id="user" v-if="proxy.isAuth(['ROOT', 'USER:SELECT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="姓名" maxlength="20" class="search-input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="phone">
                <el-input v-model="formData.phone" placeholder="手机号" maxlength="11" class="search-input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['ROOT', 'STUDENT:INSERT'])"
                    @click="showDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['ROOT', 'STUDENT:DELETE'])"
                    @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.statusLabel" @change="searchByCondition()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="正常">正常</el-radio-button>
                    <el-radio-button value="冻结">冻结</el-radio-button>
                    <el-radio-button value="离职">离职</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList"
            :header-cell-style="{ 'background': '#f5f7fa', 'padding': '10px 0 !important' }"
            v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange" border>
            <el-table-column type="selection" header-align="center" align="center" width="50" />
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="姓名" min-width="180"
                show-overflow-tooltip />
            <el-table-column prop="gender" header-align="center" align="center" label="性别" min-width="150" />
            <el-table-column prop="phone" header-align="center" align="center" label="手机号" min-width="200" />
            <el-table-column prop="email" header-align="center" align="center" label="电子邮箱" min-width="250"
                show-overflow-tooltip />
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="150" />
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'STUDENT:UPDATE'])"
                        @click="showDialog(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'STUDENT:DELETE'])"
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
        <el-dialog :title="dialog.formData.id ? '编辑学生信息' : '新增学生'" v-model="dialog.visible" width="450"
            :close-on-click-modal="false" v-if="proxy.isAuth(['ROOT', 'STUDENT:INSERT', 'STUDENT:UPDATE'])">
            <el-form ref="dialogForm" :model="dialog.formData" :rules="dialog.rule" label-width="80px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="dialog.formData.name" placeholder="姓名" maxlength="20" />
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                    <el-radio-group v-model="dialog.formData.gender">
                        <el-radio-button value="男">男</el-radio-button>
                        <el-radio-button value="女">女</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="dialog.formData.phone" placeholder="手机号码" maxlength="11" />
                </el-form-item>
                <el-form-item label="电子邮箱" prop="email">
                    <el-input v-model="dialog.formData.email" placeholder="电子邮箱" maxlength="200" />
                </el-form-item>
                <el-form-item label="用户状态" prop="status">
                    <el-radio-group v-model="dialog.formData.status">
                        <el-radio value="正常">正常</el-radio>
                        <el-radio value="冻结">冻结</el-radio>
                        <el-radio value="注销">注销</el-radio>
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
import { reactive, getCurrentInstance } from 'vue';
import { Search, Plus, Delete } from "@element-plus/icons-vue";

const { proxy } = getCurrentInstance();

/** 响应对象区域 *********************************************************/

const formData = reactive({
    name: null,
    gender: null,
    phone: null,
    email: null,
    status: null,
    statusLabel: '全部'
});

const rule = reactive({
    name: [
        { pattern: '^[\u4e00-\u9fa5]{1,20}$', message: '姓名格式不正确', trigger: 'blur' }
    ],
    phone: [
        { pattern: "^1[34578]\\d{9}$", message: "手机号码格式错误", trigger: "blur" }
    ]
});

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
        gender: null,
        phone: null,
        email: null,
        status: "正常"
    },
    rule: {
        name: [
            { required: true, message: "请输入姓名" },
            { min: 2, max: 20, message: "长度在2到20个字符之间", trigger: "blur" },
            { pattern: "^[\u4e00-\u9fa5]{2,20}$", message: "用户名格式错误", trigger: "blur" }
        ],
        gender: [
            { required: true, message: '请选择性别' }
        ],
        phone: [
            { required: true, message: "请输入手机号码" },
            { pattern: "^1[34578]\\d{9}$", message: "手机号码格式错误", trigger: "blur" },
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        phone: value
                    }
                    proxy.$http("/student/checkPhoneConflict", "POST", data, true, resp => {
                        let data = resp.data;
                        if (data.isConflict === false) {
                            callback();
                        }
                        else {
                            callback(new Error('手机号码已存在'));
                        }
                    })
                },
                trigger: "blur"
            }
        ],
        email: [
            { required: true, message: '请输入电子邮箱' },
            { pattern: "^\\w+@[\\w-]+\\.[\\w-]+$", message: "电子邮箱格式错误", trigger: "blur" }
        ],
        status: [
            { required: true, message: '请选择用户状态' }
        ]
    }

});


/** 函数定义区域 *********************************************************/





</script>

<style scoped lang="scss">
@use "student";
</style>