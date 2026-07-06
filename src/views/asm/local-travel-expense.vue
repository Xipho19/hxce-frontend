<template>
    <div id="localTravelExpense">
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
                                <div id="localTravelExpenseContainer" class="local-travel-expense-container"
                                     v-if="scope.row.detail.length > 0">
                                    <div class="reimburse-header">
                                        <div class="left">
                                            <div class="desc">详情信息</div>
                                            <img :src="scope.row.qrCode" width="60" height="60" alt="logo"/>
                                            <div class="desc">扫码查看</div>
                                        </div>
                                        <h3 class="reimburse-title"
                                            @dblclick="downloadPdf('localTravelExpenseContainer','市内交通费报销单', scope.row.status, scope.row.isOwner)">
                                            市内交通费用报销单
                                        </h3>
                                        <div class="right">
                                            <p><b>部门：</b>{{ scope.row.deptName }}</p>
                                            <p><b>姓名：</b>{{ scope.row.name }}</p>
                                        </div>
                                    </div>
                                    <table class="local-travel-expense-table">
                                        <tbody>
                                        <tr>
                                            <th>日期</th>
                                            <th>时间</th>
                                            <th>乘车路线</th>
                                            <th>事由</th>
                                            <th>金额</th>
                                        </tr>
                                        <tr v-for="(one,i) in (0,10)" :key="i">
                                            <td>{{ scope.row.detail[i] ? scope.row.detail[i].date : "" }}</td>
                                            <td>{{ scope.row.detail[i] ? scope.row.detail[i].time : "" }}</td>
                                            <td>{{ scope.row.detail[i] ? scope.row.detail[i].route : "" }}</td>
                                            <td>{{ scope.row.detail[i] ? scope.row.detail[i].reason : "" }}</td>
                                            <td>{{ scope.row.detail[i] ? scope.row.detail[i].amount : "" }}</td>
                                        </tr>
                                        <tr>
                                            <th colspan="2">金额合计（小写）</th>
                                            <th colspan="3" id="totalAmount" class="left">
                                                人民币￥：{{ scope.row.totalAmount }}元
                                            </th>
                                        </tr>
                                        <tr>
                                            <th colspan="2">合计金额（大写）</th>
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
            <el-table-column prop="createTime" header-align="center" align="center" label="车费数量" min-width="180">
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
                               :disabled="!proxy.isAuth(['LOCAL_TRAVEL_EXPENSE:ARCHIVE'])||scope.row.status!='已批准'"
                               @click="showArchiveDialog(scope.row.id,scope.row.instanceId)">
                        归档
                    </el-button>
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['LOCAL_TRAVEL_EXPENSE:LOAD'])||scope.row.status!='已归档'"
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
        <el-dialog title="填写本地车费报销申请" v-model="reimburseDialog.visible" width="1050" top="70px"
                   :close-on-click-modal="false">
            <div class="dialog-reimburse-title">
                <h3>市内交通报销单</h3>
            </div>
            <table class="dialog-local-travel-expense-table">
                <tbody>
                <tr>
                    <th>日期</th>
                    <th>时间</th>
                    <th>乘车路线</th>
                    <th>事由</th>
                    <th>金额</th>
                </tr>
                <tr v-for="i in (0,10)" :key="i">
                    <td>
                        <div contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                    <td>
                        <div contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                    <td>
                        <div contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                    <td>
                        <div contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                    <td>
                        <div contenteditable="true" @keydown="keyDownListener"></div>
                    </td>
                </tr>
                <tr>
                    <th colspan="2">金额合计（小写）</th>
                    <th colspan="3" id="dialogLtTotalAmount" class="left"></th>
                </tr>
                <tr>
                    <th colspan="2">合计金额（大写）</th>
                    <th colspan="3" id="dialogLtChineseTotalAmount" class="left"></th>
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
        <el-dialog title="执行归档" v-model="archiveDialog.visible" width="518" :close-on-click-modal="false"
                   v-if="proxy.isAuth(['LOCAL_TRAVEL_EXPENSE:ARCHIVE'])" @closed="archiveDialogClosed">
            <div class="tip">
                <el-alert type="warning" :closable="false"
                          description="请将需要归档的文件拍照并上传，归档后将无法修改，请谨慎操作。"
                          show-icon/>
                <el-upload ref="uploadArchiveImageUploader" class="upload" accept=".jpg,.jpeg" :multiple="true"
                           v-model:file-list="archiveDialog.formData.imageList" list-type="picture-card"
                           :auto-upload="false" :on-preview="previewArchiveImage">
                    <el-icon>
                        <Plus/>
                    </el-icon>
                </el-upload>
            </div>
            <template #footer>
                        <span class="dialog-footer">
                            <el-button type="danger" @click="archiveDialog.visible = false">关闭</el-button>
                            <el-button type="primary" @click="archiveSubmit()">归档</el-button>
                        </span>
            </template>
        </el-dialog>
        <el-dialog v-model="previewArchiveDialog.visible" width="750" top="7vh">
            <img :src="previewArchiveDialog.imageUrl" width="700"/>
        </el-dialog>
        <el-drawer v-model="archiveImageDrawer.visible"
                   v-if="proxy.isAuth(['LOCAL_TRAVEL_EXPENSE:ARCHIVE','LOCAL_TRAVEL_EXPENSE:LOAD'])"
                   size="508" title="已归档的照片" :direction="archiveImageDrawer.direction"
                   @closed="archiveImageDrawerClosed">
            <el-upload ref="updateArchiveImageUploader" accept=".jpg,.jpeg" :multiple="true"
                       v-model:file-list="archiveImageDrawer.formData.imageList" list-type="picture-card"
                       :auto-upload="false" :on-preview="previewArchiveImage">
                <el-icon>
                    <Plus/>
                </el-icon>
            </el-upload>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="archiveImageDrawer.visible = false">取消</el-button>
                    <el-button type="primary" @click="updateArchiveImageSubmit"
                               :disabled="!proxy.isAuth(['LOCAL_TRAVEL_EXPENSE:ARCHIVE'])">更新归档图片
                    </el-button>
                </div>
            </template>
        </el-drawer>
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
// const name = ref(localStorage.getItem('name'))

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
        localTravelList: [], //市内交通费列表
        totalAmount: null, //报销总额
    }
});

const archiveDialog = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/local/travel/expense/archive",
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
    url: proxy.$baseUrl + "/mis/travel/expense/update-archive-image",
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
    proxy.$http("/mis/local/travel/expense/search-by-page", "POST", data, true, resp => {
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
        proxy.$http('/mis/local/travel/expense/search-approval-info', 'POST', data, false, function (resp) {
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
    reimburseDialog.formData.localTravelList = [];
    reimburseDialog.formData.totalAmount = null;
    reimburseDialog.validateResult = false;

    //单元格背景色恢复成正确的样式
    let correctStyle = {"background-color": "#fff"}
    $(".dialog-local-travel-expense-table tr:gt(0)>td").css(correctStyle)

    //弹窗中所有的td单元格内容都要清空
    $(".dialog-local-travel-expense-table tr:gt(0)>td>div").text("")
    reimburseDialog.visible = true;
}


function validate() {
    let errorStyle = {"background-color": "#f89898"}
    let correctStyle = {"background-color": "#fff"}

    reimburseDialog.formData.localTravelList = [];
    reimburseDialog.validateResult = false;
    let rowList = $(".dialog-local-travel-expense-table tr:gt(0)");
    let flag = [];
    let totalAmount = 0
    let localTravelTotalAmountCell = $("#dialogLtTotalAmount")
    localTravelTotalAmountCell.text("");
    let localTravelChineseTotalAmountCell = $("#dialogLtChineseTotalAmount");
    localTravelChineseTotalAmountCell.text("");
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        let cellList = $(rowList[rowIndex]).find("td")

        let dateCell = cellList.eq(0);
        let timeCell = cellList.eq(1);
        let routeCell = cellList.eq(2);
        let reasonCell = cellList.eq(3);
        let amountCell = cellList.eq(4);

        let date = dateCell.text();
        let time = timeCell.text();
        let route = routeCell.text();
        let reason = reasonCell.text();
        let amount = amountCell.text();

        let bool = [];
        if (!isBlank(date) || !isBlank(time) || !isBlank(route)
            || !isBlank(reason) || !isBlank(amount)) {
            if (!isDate(date)) {
                dateCell.css(errorStyle);
                bool.push(false);
            }
            else {
                dateCell.css(correctStyle);
                bool.push(true);
            }

            if (!isHourAndMinute(time)) {
                timeCell.css(errorStyle);
                bool.push(false);
            }
            else {
                timeCell.css(correctStyle);
                bool.push(true);
            }

            if (isBlank(route) || route.length > 20) {
                routeCell.css(errorStyle);
                bool.push(false);
            }
            else {
                routeCell.css(correctStyle);
                bool.push(true);
            }

            if (isBlank(reason) || reason.length > 10) {
                reasonCell.css(errorStyle);
                bool.push(false);
            }
            else {
                reasonCell.css(correctStyle);
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
        }
        else {
            dateCell.css(correctStyle)
            timeCell.css(correctStyle)
            routeCell.css(correctStyle)
            reasonCell.css(correctStyle)
            amountCell.css(correctStyle)
        }

        if (bool.length > 0 && bool.every(one => (one == true))) {
            reimburseDialog.formData.localTravelList.push(
                {
                    date: date,
                    time: time,
                    route: route,
                    reason: reason,
                    amount: amount
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
            message: "请填写市内交通行程",
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
        for (let one of reimburseDialog.formData.localTravelList) {
            totalAmount = add(totalAmount, Number(one.amount));
        }
        totalAmount = Number(totalAmount).toFixed(2)
        reimburseDialog.formData.totalAmount = totalAmount;
        localTravelTotalAmountCell.text(`人民币￥：${totalAmount}元`)
        localTravelChineseTotalAmountCell.text(`人民币￥：${numberToChineseUppercaseCurrency(totalAmount)}`)

    }
    else {
        proxy.$message({
            type: "error",
            message: "行程信息存在错误",
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
            detail: coverNullToEmptyArray(reimburseDialog.formData.localTravelList),
        }

        proxy.$http("/mis/local/travel/expense/create-local-travel-expense", "POST", data, true, function (resp) {
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

function scanQRCode() {
    $("#scanQRCodeBtn").blur()
    fullscreenLoading.value = true

    $(document).keydown(function (event) {
        let keyCode = event.keyCode;
        if (keyCode == 27) {
            qrCode = ""
            formData.code = ""
            fullscreenLoading.value = false
            $(document).unbind("keydown")

        }
        else if (keyCode == 13) {
            //解除键盘事件监听
            $(document).unbind("keydown")
            formData.code = qrCode
            tableData.pageIndex = 1;
            loadTableData();
            fullscreenLoading.value = false
            qrCode = "";
        }
        else {
            qrCode += event.key
        }
    })
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
        proxy.$http("/mis/local/travel/expense/delete-local-travel-expense-by-id", "POST", data, true, resp => {
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


function showArchiveDialog(id, instanceId) {
    archiveDialog.formData.id = id;
    archiveDialog.formData.instanceId = instanceId;
    archiveDialog.visible = true;
}

function archiveDialogClosed() {
    archiveDialog.formData.id = null;
    archiveDialog.formData.instanceId = null;
    //关闭归档对话框之后要清空归档照片数组
    archiveDialog.formData.imageList = [];
}

function previewArchiveImage(uploadFile) {
    previewArchiveDialog.imageUrl = uploadFile.url
    previewArchiveDialog.visible = true
}

function archiveSubmit() {
    if (archiveDialog.formData.imageList.length === 0) {
        proxy.$message({
            type: 'error',
            message: '请选择归档照片',
            duration: 1200
        })
    }
    else {
        let imageList = archiveDialog.formData.imageList;
        const formData = new FormData();

        for (let one of imageList) {
            if (one.size > 2 * 1024 * 1024) {
                proxy.$message({
                    type: "error",
                    message: "归档照片不能超过2M",
                    duration: 1200
                })
                return
            }
            formData.append("files", one.raw);
        }

        formData.append("id", archiveDialog.formData.id);
        formData.append("instanceId", archiveDialog.formData.instanceId);
        proxy.$upload("/mis/local/travel/expense/archive", formData, true, function (resp) {
            let result = resp.result
            if (result.status === "SUCCESS") {
                proxy.$message({
                    type: "success",
                    message: "归档成功",
                    duration: 1200,
                    onClose: () => {
                        archiveDialog.visible = false;
                    }
                })

                loadTableData()
            }
            else {
                proxy.$message({
                    type: "error",
                    message: "归档失败",
                    duration: 1200
                })
            }
        });
    }
}

function showArchiveImageDrawer(id, images) {
    archiveImageDrawer.formData.id = id;
    images.forEach(image => {
        archiveImageDrawer.formData.imageList.push({url: image})
    })
    archiveImageDrawer.visible = true;
}

function archiveImageDrawerClosed() {
    archiveImageDrawer.formData.id = null;
    archiveImageDrawer.formData.imageList = [];
}


function updateArchiveImageSubmit() {
    let imageList = archiveImageDrawer.formData.imageList;
    if (imageList.length === 0) {
        proxy.$message({
            type: "error",
            message: "请选择归档照片",
            duration: 1200
        })
    }
    else if (imageList.length > 5) {
        proxy.$message({
            type: "error",
            message: "归档照片不能超过20张",
            duration: 1200
        })
    }
    else {
        let formData = new FormData();
        let images = []

        for (let one of imageList) {
            if (one.status == "success") {
                images.push(one.url.split("hxoa/")[1])
                continue
            }
            if (one.size > 2 * 1024 * 1024) {
                proxy.$message({
                    type: "error",
                    message: "归档照片不能超过2M",
                    duration: 1200
                })
                return
            }
            formData.append("files", one.raw);
        }
        formData.append("images", images)
        formData.append("id", archiveImageDrawer.formData.id);
        proxy.$upload("/mis/local/travel/expense/update-archive-images", formData, true, function (resp) {
            let result = resp.result
            if (result.status === "SUCCESS") {
                proxy.$message({
                    type: "success",
                    message: "更新归档照片成功",
                    duration: 1200,
                    onClose: () => {
                        archiveImageDrawer.visible = false;
                    }
                })

                loadTableData()
            }
            else {
                proxy.$message({
                    type: "error",
                    message: "更新归档照片失败",
                    duration: 1200
                })
            }
        });
    }
}
</script>

<style scoped lang="scss">
@use "local-travel-expense";
</style>