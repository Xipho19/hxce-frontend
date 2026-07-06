<template>
    <div id="expense">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="姓名" maxlength="20" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item>
                <el-select v-model="formData.deptId" placeholder="所属部门" class="search-input" clearable="clearable"
                           filterable>
                    <el-option v-for="item in formData.deptList" :key="item.value" :label="item.label"
                               :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-date-picker type="daterange" v-model="formData.dateRange" start-placeholder="起始日期"
                                range-separator="~"
                                end-placeholder="结束日期" value-format="YYYY-MM-DD" class="search-input-daterange"/>
            </el-form-item>
            <el-form-item>
                <el-select v-model="formData.status" placeholder="审批状态" class="search-input" clearable="clearable">
                    <el-option label="申请中" value="1"/>
                    <el-option label="已批准" value="2"/>
                    <el-option label="已否决" value="3"/>
                    <el-option label="已归档" value="4"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="FullScreen" id="scanQRCodeBtn" @click="scanQRCode()"
                           v-loading.fullscreen.lock="fullscreenLoading"
                           element-loading-text="请扫描二维码，按ESC退出">
                    扫描二维码
                </el-button>
                <el-button type="success" icon="Edit" @click="showReimburseDialog()"
                           :disabled="formData.isSystemicRole=='true'">
                    我要报销
                </el-button>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList" :header-cell-style="{'background':'#f5f7fa','padding':'10px 0 !important'}"
                  v-loading="tableData.loading" :scrollbar-always-on="false" @expand-change="expand"
                  :row-key="tableData.getRowKeys" :expand-row-keys="tableData.expands" border>
                        <el-table-column type="expand">
                            <template #default="scope">
                                <div class="expand-content">
                                    <el-tabs v-model="scope.row.activeName" type="card">
                                        <el-tab-pane name="reimburseTab">
                                            <template #label>
                                                <div class="custom-tabs-label">
                                                    <el-icon size="15">
                                                        <Tickets/>
                                                    </el-icon>
                                                    <span> 报销单</span>
                                                </div>
                                            </template>
                                            <div id="expenseContainer" class="expense-container"
                                                 v-if="scope.row.detail.length > 0">
                                                <div class="reimburse-header">
                                                    <div class="left">
                                                        <div class="desc">详情信息</div>
                                                        <img :src="scope.row.qrCode" width="60" height="60" alt="logo"/>
                                                        <div class="desc">扫码查看</div>
                                                    </div>
                                                    <h3 class="reimburse-title"
                                                        @dblclick="downloadPdf('expenseContainer','支出费用报销单', scope.row.status, scope.row.isOwner)">
                                                        支出费用报销单
                                                    </h3>
                                                    <div class="right">
                                                        <p><b>部门：</b>{{ scope.row.deptName }}</p>
                                                        <p><b>姓名：</b>{{ scope.row.name }}</p>
                                                    </div>
                                                </div>
                                                <table class="expense-table">
                                                    <tbody>
                                                    <tr>
                                                        <th>发生日期</th>
                                                        <th>报销内容</th>
                                                        <th>金额</th>
                                                        <th>备注信息</th>
                                                    </tr>
                                                    <tr v-for="(one,i) in (0,10)" :key="i">
                                                        <td>{{ scope.row.detail[i] ? scope.row.detail[i].date : "" }}</td>
                                                        <td class="left">{{ scope.row.detail[i] ? scope.row.detail[i].content : "" }}</td>
                                                        <td>{{ scope.row.detail[i] ? scope.row.detail[i].amount : "" }}</td>
                                                        <td class="left">{{ scope.row.detail[i] ? scope.row.detail[i].remark : "" }}</td>
                                                    </tr>
                                                    <tr>
                                                        <th colspan="1">金额合计（小写）</th>
                                                        <th colspan="3" id="totalAmount" class="left">
                                                            人民币￥：{{ scope.row.totalAmount }}元
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th colspan="1">合计金额（大写）</th>
                                                        <th colspan="3" id="localTravelChineseTotalAmount" class="left">
                                                            人民币￥：{{
                                                                numberToChineseUppercaseCurrency(scope.row.totalAmount)
                                                            }}
                                                        </th>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                                <ul class="reimburse-footer"
                                                    v-if="scope.row.status == '申请中'&&scope.row.isOwner==true">
                                                    <li>领款人：<span></span></li>
                                                    <li>部门经理：<span></span></li>
                                                    <li>财务审核：<span></span></li>
                                                    <li>总经理：<span></span></li>
                                                </ul>
                                            </div>
                                        </el-tab-pane>
                                        <el-tab-pane name="workflowTab">
                                            <template #label>
                                                <div class="custom-tabs-label">
                                                    <el-icon size="15">
                                                        <Memo/>
                                                    </el-icon>
                                                    <span> 审批信息</span>
                                                </div>
                                            </template>
                                            <div class="bpmn-container">
                                                <el-image :src="scope.row.bpmnPicture" :preview-src-list="[scope.row.bpmnPicture]"
                                                          :fit="'fill'">
                                                    <template #error>
                                                        <div class="image-slot">
                                                            <el-icon size="80px" class="image-slot-icon" color="#AAA">
                                                                <el-icon>
                                                                    <Picture/>
                                                                </el-icon>
                                                            </el-icon>
                                                            <div class="image-slot-error">图片加载失败</div>
                                                        </div>
                                                    </template>
                                                </el-image>
                                            </div>
                                            <div class="approval-container" v-if="scope.row.approvalList.length>0">
                                                <table class="approval-table">
                                                    <tbody>
                                                    <tr>
                                                        <th>序号</th>
                                                        <th>审批人</th>
                                                        <th>职务</th>
                                                        <th>所属部门</th>
                                                        <th>任务名称</th>
                                                        <th>审批结果</th>
                                                        <th>审批附言</th>
                                                        <th>审批时间</th>
                                                    </tr>
                                                    <tr v-for="(item,index) in scope.row.approvalList" :key="index">
                                                        <td>{{ index + 1 }}</td>
                                                        <td>
                                                            {{
                                                                item.category == "审批" ? item.approverName : item.archiverName
                                                            }}
                                                        </td>
                                                        <td>
                                                            {{
                                                                item.category == "审批" ? item.approverJobName : item.archiverJobName
                                                            }}
                                                        </td>
                                                        <td>
                                                            {{
                                                                item.category == "审批" ? item.approverDeptName : item.archiverDeptName
                                                            }}
                                                        </td>
                                                        <td>{{ item.taskName }}</td>
                                                        <td>
                                                            {{
                                                                item.category == "审批" ? item.approvalResult : item.archiveResult
                                                            }}
                                                        </td>
                                                        <td>
                                                            <span class="comment">{{ item.approvalComment }}</span>
                                                        </td>
                                                        <td>{{ item.completeTime }}</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </el-tab-pane>
                                    </el-tabs>
                                </div>
                            </template>
                        </el-table-column>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="报销人" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="deptName" header-align="center" align="center" label="所属部门" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="jobName" header-align="center" align="center" label="职务" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="totalAmount" header-align="center" align="center" label="总金额" min-width="150"/>
            <el-table-column prop="createTime" header-align="center" align="center" label="报销项目数量"
                             min-width="180">
                <template #default="scope">
                    <span>{{ scope.row.detail.length }}个</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" label="执行状态" min-width="150"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="230" label="操作">
                <template #default="scope">
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['EXPENSE:ARCHIVE'])||scope.row.status!='已批准'"
                               @click="showArchiveDialog(scope.row.id,scope.row.instanceId)">
                        归档
                    </el-button>
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['EXPENSE:LOAD'])||scope.row.status!='已归档'"
                               @click="showArchiveImageDrawer(scope.row.id,scope.row.images)">
                        查档
                    </el-button>
                    <el-button type="primary" :disabled="scope.row.isOwner==false||scope.row.status=='已归档'"
                               @click="deleteTableRows(scope.row.id)" link>
                        撤销
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="pageSizeChange" @current-change="pageIndexChange"
                       :current-page="tableData.pageIndex" :page-sizes="[10, 20, 50]" :page-size="tableData.pageSize"
                       :total="tableData.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
        <el-dialog title="填写支出费用报销申请" v-model="reimburseDialog.visible" width="1050" top="70px"
                   :close-on-click-modal="false">
            <div class="dialog-reimburse-title">
                <h3>支出费用报销单</h3>
            </div>
            <table class="dialog-expense-table">
                <tbody>
                <tr>
                    <th>发生日期</th>
                    <th>报销内容</th>
                    <th>金额</th>
                    <th>备注信息</th>
                </tr>
                <tr v-for="i in (0,10)" :key="i">
                    <td>
                        <div contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                    <td>
                        <div class="left" contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                    <td>
                        <div contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                    <td>
                        <div class="left" contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                </tr>
                <tr>
                    <th>金额合计（小写）</th>
                    <th colspan="3" id="dialogTotalAmount" class="left"></th>
                </tr>
                <tr>
                    <th>合计金额（大写）</th>
                    <th colspan="3" id="dialogChineseTotalAmount" class="left"></th>
                </tr>
                </tbody>
            </table>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="reimburseDialog.visible = false">取消</el-button>
                    <el-button type="primary" @click="validate()">校验报销单</el-button>
                    <el-button type="primary" @click="saveSubmit()">提交报销单</el-button>
                </span>
            </template>
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
    dateRange: [],
    status: null,
    code: "",
    isSystemicRole: localStorage.getItem('isSystemicRole')
});

const rule = reactive({
    name: [
        {pattern: '^[\u4e00-\u9fa5]{1,20}$', message: '姓名格式不正确', trigger: 'blur'}
    ]
});

const tableData = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    expands: [],
    getRowKeys(row) {
        return row.id;
    }
});

const reimburseDialog = reactive({
    visible: false,
    validateResult: false,
    formData: {
        itemList: [], //报销项目列表
        totalAmount: null, //报销总额
    }
});

const archiveDialog = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/expense/archive",
    formData: {
        id: null,
        imageList: []
    }
});

const previewArchiveDialog = reactive({
    visible: false,
    imageUrl: null
})


const archiveImageDrawer = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/expense/update-archive-image",
    direction: 'rtl',
    formData: {
        id: null,
        imageList: []
    },
    previewVisible: false,
    previewImage: null
})

//页面遮罩，用于扫描二维码中
const fullscreenLoading = ref(false)
//用于缓存扫描的二维码
let qrCode = "";

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

function loadTableData() {
    tableData.loading = true;
    tableData.expands = [];
    const data = {
        name: formData.name,
        deptId: formData.deptId,
        startDate: formData.dateRange ? formData.dateRange[0] : null,
        endDate: formData.dateRange ? formData.dateRange[1] : null,
        status: formData.status,
        code: formData.code,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/expense/search-by-page", "POST", data, true, resp => {
        formData.code = null;
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            let list = page.list;
            let statusJson = {
                "1": "申请中",
                "2": "已批准",
                "3": "已否决",
                "4": "已归档"
            }

            list.forEach(one => {
                one.status = statusJson[one.status];

                let detail = one.detail
                for (let item of detail) {
                    item.amount = `￥${item.amount}元`
                }

                let images = []
                one.images.forEach(image => {
                    image = proxy.$minioUrl + "/" + image;
                    images.push(image);
                })
                one.images = images;

            })

            tableData.dataList = list;
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

function expand(row, expandedRows) {
    if (expandedRows.length > 0) {
        tableData.expands = [];
        row.activeName = "reimburseTab"
        let data = {
            instanceId: row.instanceId
        };
        proxy.$http('/mis/expense/search-approval-info', 'POST', data, false, function (resp) {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                row.bpmnPicture = result.bpmnPicture
                let approvalList = result.approvalList;
                approvalList.forEach(one => {
                    one.completeTime = dayjs(one.completeTime).format("YYYY/MM/DD HH:mm")
                    one.approvalResult = (one.approvalResult ? "通过" : "否决")
                })
                row.approvalList = approvalList;

                let opts = {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    quality: 0.92,
                    margin: 1,
                };

                QRCode.toDataURL(row.code, opts)
                    .then(base64 => {
                        row.qrCode = base64; // 二维码的DataURL
                    })
                    .catch(error => {
                        console.error(error);
                    });
                tableData.expands.push(row.id);
            }
        });
    }
    else {
        tableData.expands = [];
    }
}

//禁止在弹窗的单元格中输入回车和换行
function keyDownListener(e) {
    reimburseDialog.validateResult = false;
    let keyCode = e.keyCode;
    if (keyCode == 13 || keyCode == 32) {
        e.preventDefault();
    }
}

function showReimburseDialog() {
    reimburseDialog.formData.itemList = [];
    reimburseDialog.formData.totalAmount = null;
    reimburseDialog.validateResult = false;

    //单元格背景色恢复成正确的样式
    let correctStyle = {"background-color": "#fff"}
    $(".dialog-expense-table tr:gt(0)>td").css(correctStyle)

    //弹窗中所有的td单元格内容都要清空
    $(".dialog-expense-table tr:gt(0)>td>div").text("")
    reimburseDialog.visible = true;
}

function validate() {
    let errorStyle = {"background-color": "#f89898"}
    let correctStyle = {"background-color": "#fff"}

    reimburseDialog.formData.itemList = [];
    reimburseDialog.validateResult = false;
    let rowList = $(".dialog-expense-table tr:gt(0)");
    let flag = [];
    let totalAmount = 0
    let totalAmountCell = $("#dialogTotalAmount")
    totalAmountCell.text("");
    let chineseTotalAmountCell = $("#dialogChineseTotalAmount");
    chineseTotalAmountCell.text("");
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        let cellList = $(rowList[rowIndex]).find("td")

        let dateCell = cellList.eq(0);
        let contentCell = cellList.eq(1);
        let amountCell = cellList.eq(2);
        let remarkCell = cellList.eq(3);

        let date = dateCell.text();
        let content = contentCell.text();

        let amount = amountCell.text();
        let remark = remarkCell.text();

        let bool = [];
        if (!isBlank(date) || !isBlank(content) || !isBlank(amount) || !isBlank(remark)) {
            if (!isDate(date)) {
                dateCell.css(errorStyle);
                bool.push(false);
            }
            else {
                dateCell.css(correctStyle);
                bool.push(true);
            }

            if (isBlank(content) || content.length > 50) {
                contentCell.css(errorStyle);
                bool.push(false);
            }
            else {
                contentCell.css(correctStyle);
                bool.push(true);
            }

            if (!isAmount(amount)) {
                amountCell.css(errorStyle);
                bool.push(false);
            }
            else {
                amountCell.css(correctStyle);
                bool.push(true);
            }

            if (remark.length > 25) {
                remarkCell.css(errorStyle);
                bool.push(false);
            }
            else {
                remarkCell.css(correctStyle);
                bool.push(true);
            }
        }
        else {
            dateCell.css(correctStyle)
            contentCell.css(correctStyle)
            amountCell.css(correctStyle)
            remarkCell.css(correctStyle)
        }

        if (bool.length > 0 && bool.every(one => (one == true))) {
            reimburseDialog.formData.itemList.push(
                {
                    date: date,
                    content: content,
                    amount: amount,
                    remark: remark
                }
            )
            flag.push(true);
        }
        else if (bool.length > 0 && bool.some(one => (one == false))) {
            flag.push(false);
        }
    }
    if (flag.length == 0) {
        proxy.$message({
            type: "error",
            message: "请填写支出费用报销单",
            duration: 1200
        })
        reimburseDialog.validateResult = false;
    }
    else if (flag.every(one => (one == true))) {
        proxy.$message({
            type: "success",
            message: "报销单验证成功",
            duration: 1200
        })
        reimburseDialog.validateResult = true;
        for (let one of reimburseDialog.formData.itemList) {
            totalAmount = add(totalAmount, Number(one.amount));
        }
        totalAmount = Number(totalAmount).toFixed(2)
        reimburseDialog.formData.totalAmount = totalAmount;
        totalAmountCell.text(`人民币￥：${totalAmount}元`)
        chineseTotalAmountCell.text(`人民币￥：${numberToChineseUppercaseCurrency(totalAmount)}`)

    }
    else {
        proxy.$message({
            type: "error",
            message: "支出费用信息存在错误",
            duration: 1200
        })
        reimburseDialog.validateResult = false;
    }
}

function saveSubmit() {
    if (!reimburseDialog.validateResult) {
        proxy.$message({
            type: "error",
            message: "请先验证报销单",
            duration: 1200
        })
    }
    else {
        let data = {
            totalAmount: coverBlankToZero(reimburseDialog.formData.totalAmount),
            detail: coverNullToEmptyArray(reimburseDialog.formData.itemList),
        }

        proxy.$http("/mis/expense/create-expense", "POST", data, true, function (resp) {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                proxy.$message({
                    type: "success",
                    message: "成功提交报销申请",
                    duration: 1200,
                    onClose: () => {
                        reimburseDialog.visible = false;
                        loadTableData();
                    }
                });
            }
        })
    }
}

function downloadPdf(id, filename, status, isOwner) {
    if (status == "申请中" && isOwner == true) {
        proxy.getPdf(id, filename)
    }
}

function deleteTableRows(id) {
    proxy.$confirm('确认撤销该条报销记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const data = {
            "id": id
        }
        proxy.$http("/mis/expense/delete-expense-by-id", "POST", data, true, resp => {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                proxy.$message({
                    message: '撤销成功',
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
                    message: '撤销失败',
                    duration: 1200
                })
            }
        })
    })
}

</script>
<style scoped lang="scss">
@use "expense";
</style>