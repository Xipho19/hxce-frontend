<template>
    <div id="amect">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="姓名" maxlength="20" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item>
                <el-select v-model="formData.deptId" class="search-input" placeholder="部门" filterable
                           clearable="clearable">
                    <el-option v-for="item in formData.deptList" :key="item.value" :label="item.label"
                               :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="formData.typeId" class="search-input" placeholder="罚款类型" filterable
                           clearable="clearable">
                    <el-option v-for="item in formData.typeList" :key="item.value" :label="item.label"
                               :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="formData.dateRange" type="daterange" range-separator="~"
                                value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"
                                class="search-input-daterange"/>
            </el-form-item>
            <el-form-item>
                <el-select v-model="formData.status" class="search-input" placeholder="状态" clearable="clearable">
                    <el-option label="未缴纳" value="1"/>
                    <el-option label="已缴纳" value="2"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!isAuth(['ROOT', 'AMECT:INSERT'])"
                           @click="showAmectDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!isAuth(['ROOT', 'AMECT:DELETE'])"
                           @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.modeLabel" @change="searchByCondition()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="我的">我的</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList" :header-cell-style="{'background':'#f5f7fa','padding':'10px 0 !important'}"
                  v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange"
                  @expand-change="expand" :row-key="tableData.getRowKeys" :expand-row-keys="tableData.expands" border>
            <el-table-column type="expand">
                <template #default="scope">
                    <div class="expand-container">
                        <el-descriptions direction="vertical" :column="3" border>
                            <el-descriptions-item label="罚款原因" min-width="500">{{ scope.row.reason }}
                            </el-descriptions-item>
                            <el-descriptions-item label="建议罚款" label-align="center" align="center" min-width="150">
                                {{ scope.row.typeAmount }}元
                            </el-descriptions-item>
                            <el-descriptions-item label="实际罚款" label-align="center" align="center" min-width="150">
                                {{ scope.row.amount }}元
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"/>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="姓名" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="deptName" header-align="center" align="center" label="部门名称" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="amount" header-align="center" align="center" label="罚款金额"
                             min-width="150" show-overflow-tooltip/>
            <el-table-column prop="type" header-align="center" align="center" label="罚款类别" min-width="150"
                             show-overflow-tooltip/>
            <el-table-column prop="date" header-align="center" align="center" label="创建日期" min-width="150"
                             show-overflow-tooltip/>
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="150"
                             show-overflow-tooltip/>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="danger" :disabled="scope.row.isOwner==false || scope.row.status=='已缴纳'"
                               @click="showPaymentDialog(scope.row.id)" link>
                        支付
                    </el-button>
                    <el-button type="primary"
                               :disabled="!proxy.isAuth(['ROOT','AMECT:UPDATE']) || scope.row.status=='已缴纳'"
                               @click="showAmectDialog(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary"
                               :disabled="!proxy.isAuth(['ROOT','AMECT:DELETE']) || scope.row.status=='已缴纳'"
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
        <el-dialog :title="amectDialog.formData.id? '编辑罚款' : '新增罚款'" v-model="amectDialog.visible" width="692"
                   :close-on-click-modal="false" v-if="proxy.isAuth(['ROOT','AMECT:INSERT','AMECT:UPDATE'])">
            <el-form :model="amectDialog.formData" ref="amectDialogForm" :rules="amectDialog.rule" label-width="60px">
                <el-form-item label="类型" prop="typeId">
                    <el-select v-model="amectDialog.formData.typeId" placeholder="罚款类型" @change="changeType"
                               style="width:40%">
                        <el-option v-for="item in formData.typeList" :label="item.label" :value="item.value"/>
                    </el-select>
                    <span class="dialog-input-description">必须选择一个罚款类型，罚款金额可以自动生成</span>
                </el-form-item>
                <el-form-item label="金额" prop="amount">
                    <el-input v-model="amectDialog.formData.amount" style="width:40%" placeholder="罚款金额" clearable/>
                    <span class="dialog-input-description">生成的罚款金额为建议金额，具体金额可以根据实际情况调整</span>
                </el-form-item>
                <el-form-item label="原因" prop="reason">
                    <el-input type="textarea" :rows="4" placeholder="罚款原因" v-model="amectDialog.formData.reason"
                              maxlength="300" show-word-limit clearable="clearable"/>
                </el-form-item>
                <el-form-item label="成员" prop="members" v-if="!amectDialog.formData.id">
                    <el-transfer v-model="amectDialog.formData.members" :data="amectDialog.formData.users"
                                 :titles="['员工', '当事人']"
                                 filter-placeholder="请输入姓名" filterable/>
                </el-form-item>
            </el-form>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="amectDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="saveSubmit()">保存</el-button>
            </span>
            </template>
        </el-dialog>
        <el-dialog title="支付罚款" :close-on-click-modal="false" v-model="paymentDialog.visible" width="305px" center>
            <img :src="paymentDialog.qrCode" class="qrcode" v-if="!paymentDialog.result"/>
            <div v-if="paymentDialog.result" class="pay-success">
                <el-result icon="success" title="付款成功" subTitle="您已经成功支付了该笔罚款"></el-result>
            </div>
            <div class="dialog-footer-style">
                <el-button type="danger" v-if="!paymentDialog.result" @click="paymentDialog.visible = false">
                    取消支付
                </el-button>
                <el-button type="primary" v-if="!paymentDialog.result" @click="searchPaymentResult()">支付成功
                </el-button>
                <el-button type="primary" v-if="paymentDialog.result" @click="paymentDialog.visible = false">
                    关闭窗口
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import {ref, reactive, getCurrentInstance} from 'vue';
import {dayjs, genFileId} from "element-plus";
import {
    Search,
    FullScreen,
    Edit,
    WarningFilled,
    SuccessFilled,
    Picture,
    Tickets,
    Memo, Plus
} from "@element-plus/icons-vue";

import {isDate, isHour, isAmount, isCity, isBlank, isDays, isHourAndMinute} from "@/utils/validate";
import {coverBlankToNull, coverBlankToZero, coverNullToEmptyArray} from "@/utils/common";
import QRCode from 'qrcode';
import $ from 'jquery';
import {
    numberToChineseUppercaseCurrency,
    add,
    subtract,
} from "pixiu-number-toolkit";

const {proxy} = getCurrentInstance();

/** 响应对象区域 *********************************************************/
const formData = reactive({
    name: null,
    deptId: null,
    deptList: [],
    typeList: [],
    typeId: null,
    dateRange: [],
    status: null,
    modeLabel: "罚款记录",
    code: "",
    modeLabel: "全部"
});

const rule = reactive({
    name: [
        {pattern: '^[\u4e00-\u9fa5]{1,20}$', message: '姓名格式不正确', trigger: 'blur'}
    ],
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

const amectDialog = reactive({
    visible: false,
    formData: {
        id: null,
        typeId: null,
        amount: null,
        reason: null,
        members: [],
        users: []
    },
    rule: {
        typeId: [
            {required: true, message: "请选择罚款类型"}
        ],
        amount: [
            {required: true, message: "请输入罚款金额"},
            {
                pattern: '^(0|[1-9]\\d{0,9})(\\.\\d{2})?$',
                message: '罚款金额格式错误',
                trigger: 'blur'
            }
        ],
        reason: [
            {required: true, message: "请输入罚款原因", trigger: 'blur'}
        ],
        members: [
            {required: true, message: "请选择罚款员工", trigger: 'blur'}
        ]
    }
});

const paymentDialog = reactive({
    visible: false,
    id: null,
    result: false,
    qrCode: null
});


/** 函数定义区域 *********************************************************/
function loadDeptList() {
    proxy.$http("/mis/dept/search-all-dept", "GET", null, true, function (resp) {
        let result = resp.result;
        let deptList = [];
        for (let i = 0; i < result.deptList.length; i++) {
            deptList.push({
                value: result.deptList[i].id,
                label: result.deptList[i].name
            });
        }
        formData.deptList = deptList;
    })
}

loadDeptList();

function loadTypeList() {
    proxy.$http("/mis/amect/type/search-all-amect-type", "GET", null, true, function (resp) {
        let result = resp.result;
        let typeList = [];
        for (let i = 0; i < result.typeList.length; i++) {
            typeList.push({
                value: result.typeList[i].id,
                label: result.typeList[i].type,
                amount: result.typeList[i].amount
            });
        }
        formData.typeList = typeList;
    })
}

loadTypeList();

function loadTableData() {
    tableData.loading = true;
    tableData.expands = [];

    const data = {
        name: formData.name,
        deptId: formData.deptId,
        typeId: formData.typeId,
        startDate: formData.dateRange ? formData.dateRange[0] : null,
        endDate: formData.dateRange ? formData.dateRange[1] : null,
        status: formData.status,
        mine: (formData.modeLabel == "我的") ? true : false,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/amect/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            page.list.forEach(one => {
                one.status = (one.status == 1) ? "未缴纳" : "已缴纳";
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
    if (row.status == "已缴纳") {
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
        tableData.expands.push(row.id);
    }
    else {
        tableData.expands = [];
    }
}


function showAmectDialog(id) {
    amectDialog.formData.id = (id) ? id : null;
    amectDialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.amectDialogForm.resetFields();
        if (!id) {
            //加载用户列表
            let data = {
                status: 1
            }
            proxy.$http("/mis/user/search-all-user", "POST", data, true, function (resp) {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    amectDialog.formData.members = []
                    result.userList.forEach(one => {
                        amectDialog.formData.users.push({"label": one.name, "key": one.id})
                    });
                }

            });
        }
        else {
            let data = {
                id: id
            }
            proxy.$http("/mis/amect/search-by-id", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    amectDialog.formData.typeId = result.amect.typeId;
                    amectDialog.formData.amount = result.amect.amount;
                    amectDialog.formData.reason = result.amect.reason;
                }
            })
        }

    })
}

function saveSubmit() {
    proxy.$refs.amectDialogForm.validate((valid) => {
        if (valid) {
            let data = {
                id: amectDialog.formData.id,
                typeId: amectDialog.formData.typeId,
                amount: amectDialog.formData.amount,
                reason: amectDialog.formData.reason,
            }

            let url = null
            if (amectDialog.formData.id) {
                url = "/mis/amect/update"
            }
            else {
                url = "/mis/amect/insert"
                data.members = amectDialog.formData.members
            }
            proxy.$http(url, "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    proxy.$message({
                        type: 'success',
                        message: '保存成功',
                        duration: 1200,
                        onClose: () => {
                            amectDialog.visible = false;
                            loadTableData();
                        }
                    });
                }
            })
        }
    })
}

function changeType(id) {
    formData.typeList.forEach(one => {
        if (one.value == id) {
            amectDialog.formData.amount = one.amount;
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
        proxy.$http("/mis/amect/delete-by-ids", "POST", data, true, resp => {
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

function showPaymentDialog(id) {
    proxy.$confirm('您确定支付该笔罚款？', '提示信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        paymentDialog.id = id;
        let data = {
            id: id
        }
        proxy.$http("/mis/amect/create-payment", "POST", data, true, resp => {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                if (!result.paymentResult) {
                    let qrCodeBase64 = result.qrCodeBase64;
                    paymentDialog.qrCode = result.qrCodeBase64;
                    proxy.$nextTick(() => {
                        paymentDialog.visible = true;
                        let token = localStorage.getItem("token");
                        //检测支付结果
                        let url = `${proxy.$baseUrl}/mis/amect/sse/push-payment-result?token=${token}&id=${id}`;
                        let eventSource = new EventSource(url);
                        eventSource.onopen = () => {
                            console.log('SSE 连接成功');
                        };
                        eventSource.onmessage = (event) => {
                            let data = JSON.parse(event.data);
                            console.log('SSE 接收到消息：', data);
                            if (data.paymentResult) {
                                //支付成功
                                paymentDialog.result = true;
                                loadTableData();
                            }
                        };
                        eventSource.onerror = (error) => {
                            console.error('SSE错误信息：', error);
                            eventSource.close();
                        };
                    });
                }
                else {
                    proxy.$message({
                        message: '该笔罚款已缴纳',
                        type: 'success',
                        duration: 1200
                    });
                    paymentDialog.result = true;
                    loadTableData();
                }


            }
        })
    });
}

function searchPaymentResult() {
    let id = paymentDialog.id;
    let data = {
        id: id
    }
    proxy.$http("/mis/amect/search-payment-result", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status === "SUCCESS" && result.paymentResult) {
            paymentDialog.result = true;
            loadTableData();
        }
        else {
            proxy.$message({
                message: '付款不成功',
                type: 'error',
                duration: 1200
            });
        }
    })
}


</script>
<style scoped lang="scss">
@use "amect";
</style>