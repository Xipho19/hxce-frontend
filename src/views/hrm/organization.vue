<template>
    <div id="organization" v-if="proxy.isAuth(['ROOT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="code">
                <el-input v-model="formData.code" placeholder="机构代码" maxlength="20" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="机构名称" maxlength="50" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item>
                <el-select v-model="formData.city" placeholder="所在城市" class="search-input" clearable="clearable">
                    <el-option v-for="item in formData.cityList" :key="item.value" :label="item.label"
                               :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['ROOT'])"
                           @click="showDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['ROOT'])"
                           @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.statusLabel" @change="searchByCondition()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="正常">正常</el-radio-button>
                    <el-radio-button value="暂停">暂停</el-radio-button>
                    <el-radio-button value="关闭">关闭</el-radio-button>
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
            <el-table-column prop="name" header-align="center" align="center" label="机构名称" min-width="300"
                             show-overflow-tooltip/>
            <el-table-column prop="code" header-align="center" align="center" label="编码" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="organizationTel" header-align="center" align="center" label="联系电话"
                             min-width="180"/>
            <el-table-column prop="city" header-align="center" align="center" label="城市" min-width="200"/>
            <el-table-column prop="openingHours" header-align="center" align="center" label="营业时间" min-width="200"/>
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="150"/>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT'])" @click="showDialog(scope.row.id)"
                               link>
                        修改
                    </el-button>
                    <el-button type="primary"
                               :disabled="!proxy.isAuth(['ROOT'])||!['暂停','关闭'].includes(scope.row.status)"
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
        <el-dialog :title="dialog.formData.id? '编辑机构' : '新增机构'" v-model="dialog.visible" width="450"
                   :close-on-click-modal="false"
                   v-if="proxy.isAuth(['ROOT', 'ORGANIZATION:INSERT','ORGANIZATION:UPDATE'])">
            <div class="step-container">
                <el-steps class="step-container" :active="dialog.step" align-center>
                    <el-step title="步骤1" description="填写基本信息"/>
                    <el-step title="步骤2" description="填写介绍与备注"/>
                    <el-step title="步骤3" description="提示信息"/>
                </el-steps>
            </div>
            <div class="step-content">
                <el-form ref="dialogForm_1" :model="dialog.formData" :rules="dialog.rule" label-width="80px"
                         v-show="dialog.step === 1">
                    <el-form-item label="机构名称" prop="name">
                        <el-input v-model="dialog.formData.name" placeholder="机构名称" maxlength="50"/>
                    </el-form-item>
                    <el-form-item label="机构编号" prop="code">
                        <el-input v-model="dialog.formData.code" placeholder="机构编号" maxlength="20"/>
                    </el-form-item>
                    <el-form-item label="机构电话" prop="organizationTel">
                        <el-input v-model="dialog.formData.organizationTel" placeholder="机构电话" maxlength="13"/>
                    </el-form-item>
                    <el-form-item label="业务电话" prop="businessTel">
                        <el-input v-model="dialog.formData.businessTel" placeholder="业务电话" maxlength="13"/>
                    </el-form-item>
                    <el-form-item label="所在城市" prop="city">
                        <el-input v-model="dialog.formData.city" placeholder="城市名称" maxlength="15"/>
                    </el-form-item>
                    <el-form-item label="公司地址" prop="address">
                        <el-input v-model="dialog.formData.address" placeholder="公司地址" maxlength="100"/>
                    </el-form-item>
                    <el-form-item label="营业时间" prop="openingHours">
                        <el-time-picker v-model="dialog.formData.openingHours" start-placeholder="起始时间"
                                        end-placeholder="结束时间" range-separator="~"
                                        :default-value="[new Date().setHours(9,0), new Date().setHours(18,0)]"
                                        format="HH:mm" value-format="HH:mm" is-range/>
                    </el-form-item>
                </el-form>
                <el-form ref="dialogForm_2" :model="dialog.formData" :rules="dialog.rule" label-width="80px"
                         v-show="dialog.step === 2">
                    <el-form-item label="机构简介" prop="introduction">
                        <el-input type="textarea" v-model="dialog.formData.introduction" placeholder="机构简介"
                                  maxlength="200" :rows="5"/>
                    </el-form-item>
                    <el-form-item label="备注信息" prop="remark">
                        <el-input type="textarea" v-model="dialog.formData.remark" placeholder="备注信息"
                                  maxlength="200" :rows="5"/>
                    </el-form-item>
                    <el-form-item label="机构状态" prop="status">
                        <el-radio-group v-model="dialog.formData.status">
                            <el-radio value="正常">正常</el-radio>
                            <el-radio value="暂停">暂停</el-radio>
                            <el-radio value="关闭">关闭</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
                <div class="step-content-tip" v-show="dialog.step === 3">
                    创建机构之后，必须要给该机构创建管理员账号。由管理员账号创建机构的各种初始数据，例如部门、职位和员工等。超级管理员账号无法参与机构的业务管理。
                </div>
            </div>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">取消</el-button>
                <el-button type="primary" :icon="ArrowLeft" @click="prevStep()"
                           :disabled="dialog.step == 1">上一步</el-button>
                <el-button type="primary" @click="nextStep()" v-if="dialog.step < 3">下一步<el-icon
                    class="el-icon--right"><ArrowRight/></el-icon></el-button>
                <el-button type="danger" :icon="DocumentAdd" @click="saveSubmit()"
                           v-if="dialog.step === 3">保存</el-button>

            </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {reactive, getCurrentInstance, ref} from 'vue';

import {Search, Plus, Delete, ArrowLeft, ArrowRight, DocumentAdd} from "@element-plus/icons-vue";

const {proxy} = getCurrentInstance();

/** 响应对象区域 *********************************************************/
const formData = reactive({
    code: null,
    name: null,
    city: null,
    cityList: [],
    statusLabel: '全部'
});

const rule = reactive({
    code: [
        {pattern: '^[0-9a-zA-Z]{1,20}$', message: '编号格式错误', trigger: 'blur'}
    ],
    name: [
        {pattern: '^[0-9a-zA-Z\u4e00-\u9fa5\-_\(\)（）]{2,50}$', message: '机构名称格式错误', trigger: 'blur'}
    ],
    tel: [
        {pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误', trigger: 'blur'}
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
    step: 1,
    formData: {
        id: null,
        name: null,
        code: null,
        organizationTel: null,
        businessTel: null,
        city: null,
        address: null,
        introduction: null,
        remark: null,
        openingHours: [],
        status: "正常"

    },
    rule: {
        name: [
            {required: true, message: "请输入机构名称"},
            {min: 2, max: 30, message: '长度在2到50个字符之间', trigger: 'blur'},
            {pattern: '^[0-9a-zA-Z\u4e00-\u9fa5\-_\(\)（）]{2,50}$', message: '机构名称格式错误', trigger: 'blur'},
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        name: value
                    }
                    proxy.$http("/mis/organization/check-name-conflict", "POST", data, true, resp => {
                        let result = resp.result;
                        if (result.status == "SUCCESS") {
                            if (result.isConflict === false) {
                                callback();
                            }
                            else {
                                callback(new Error('机构名称已存在'));
                            }
                        }
                    })
                },
                trigger: 'blur'
            }
        ],
        code: [
            {required: true, message: "请输入机构编号"},
            {min: 2, max: 30, message: '长度在2到20个字符之间', trigger: 'blur'},
            {pattern: '^[0-9a-zA-Z]{2,20}$', message: '编号格式错误', trigger: 'blur'},
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        code: value
                    }
                    proxy.$http("/mis/organization/check-code-conflict", "POST", data, true, resp => {
                        let result = resp.result;
                        if (result.status == "SUCCESS") {
                            if (result.isConflict === false) {
                                callback();
                            }
                            else {
                                callback(new Error('机构编号已存在'));
                            }
                        }
                    })
                },
                trigger: 'blur'
            }
        ],
        organizationTel: [
            {required: true, message: "请输入机构电话"},
            {pattern: '^((0[1-9][0-9]{0,2})[-]?)?([1-9][0-9]{6,7})$', message: '电话号码格式错误', trigger: 'blur'}
        ],
        businessTel: [
            {required: true, message: "请输入业务电话"},
            {pattern: '^1[34578]\\d{9}$', message: '电话号码格式错误', trigger: 'blur'}
        ],
        city: [
            {required: true, message: '请输入所在城市'},
            {min: 2, max: 15, message: '长度在2到15个字符之间'},
            {pattern: '^[\u4e00-\u9fa5]{2,15}$', message: '城市格式错误', trigger: 'blur'}
        ],
        address: [
            {required: true, message: '请输入公司地址'},
            {min: 2, max: 15, message: '长度在6到100个字符之间'},
            {
                required: true,
                pattern: '^[a-z-A-Z0-9\u4e00-\u9fa5_\-]{6,100}$',
                message: '地址格式错误',
                trigger: 'blur'
            },
        ],
        openingHours: [
            {required: true, message: '营业时间不能为空'}
        ]

    }

});


/** 函数定义区域 *********************************************************/

function loadCityList() {
    proxy.$http("/mis/organization/search-city-list", "GET", null, true, resp => {
        let result = resp.result;
        if (result.status === "SUCCESS") {
            formData.cityList = []
            for (let one of result.cityList) {
                formData.cityList.push({label: one, value: one})
            }
        }

    })
}

loadCityList();


function loadTableData() {
    tableData.loading = true;
    let temp = {
        "全部": null,
        "正常": 1,
        "暂停": 2,
        "关闭": 3
    }
    formData.status = temp[formData.statusLabel]
    const data = {
        code: formData.code,
        name: formData.name,
        city: formData.city,
        status: formData.status,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/organization/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status === "SUCCESS") {
            let page = result.page;
            let temp = {
                "1": "正常",
                "2": "暂停",
                "3": "关闭"
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

function showDialog(id) {
    dialog.formData.id = (id) ? id : null;
    if (id) {
        const data = {
            id: id
        }
        proxy.$http("/mis/organization/search-by-id", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status === "SUCCESS") {
                    let organization = result.organization
                    dialog.formData.code = organization.code;
                    dialog.formData.name = organization.name;
                    dialog.formData.organizationTel = organization.organizationTel;
                    dialog.formData.businessTel = organization.businessTel;
                    dialog.formData.city = organization.city;
                    dialog.formData.address = organization.address;
                    dialog.formData.introduction = organization.introduction;
                    dialog.formData.remark = organization.remark;
                    let openingHours = organization.openingHours.replaceAll(" ", "").split("~");
                    dialog.formData.openingHours = [openingHours[0], openingHours[1]];
                    let temp = {
                        "1": "正常",
                        "2": "暂停",
                        "3": "关闭"
                    }
                    dialog.formData.status = temp[organization.status];

                }
            }
        )
    }

    dialog.step = 1
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.dialogForm_1.resetFields();
        proxy.$refs.dialogForm_2.resetFields();
    })
}

function prevStep() {
    if (dialog.step > 1) {
        dialog.step--;
    }

}

function nextStep() {
    proxy.$refs.dialogForm_1.validate((valid) => {
        if (valid && dialog.step < 3) {
            dialog.step++;
        }
    })
}


function saveSubmit() {
    let url = "/mis/organization/";
    if (dialog.formData.id) {
        url += "update";
    }
    else {
        url += "insert";
    }
    let data = JSON.parse(JSON.stringify(dialog.formData))
    let temp = {
        "正常": 1,
        "暂停": 2,
        "关闭": 3
    }
    data.status = temp[data.status]
    proxy.$http(url, "POST", data, true, resp => {
        let result = resp.result;
        if (result.status === "SUCCESS") {
            proxy.$message({
                type: "success",
                message: "保存成功",
                duration: 1200
            })
            dialog.visible = false;
            loadCityList();
            loadTableData();
        }
        else {
            proxy.$message({
                type: "error",
                message: "保存失败",
                duration: 1200
            })
        }
    })
}


function selectable(row, index) {
    //TODO：实现行选择功能
    return true;
}

function selectionChange(selection) {
    tableData.selections = selection
}

function deleteTableRows(id) {
    let ids = id ? [id] : tableData.selections.map(one => one.id);
    if (ids.length === 0) {
        proxy.$message({
            type: "warning",
            message: "请选择要删除的记录",
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
        proxy.$http("/mis/organization/delete-by-ids", "POST", data, true, resp => {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                proxy.$message({
                    message: '删除成功',
                    type: 'success',
                    duration: 1200,
                    onClose: () => {
                        loadCityList();
                        loadTableData();
                    }
                });
            }
            else {
                proxy.$message({
                    type: "error",
                    message: "删除失败",
                    duration: 1200
                })
            }
        })
    })
}


</script>
<style scoped lang="scss">
@use "organization";
</style>