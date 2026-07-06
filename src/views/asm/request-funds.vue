<template>
    <div id="travel_expense">
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
                <el-button type="success" icon="Edit" @click="showRequestFundsDialog()"
                           :disabled="formData.isSystemicRole=='true'">
                    我要请款
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
                            <el-tab-pane name="requestFundsTab">
                                <template #label>
                                    <div class="custom-tabs-label">
                                        <el-icon size="15">
                                            <Tickets/>
                                        </el-icon>
                                        <span> 请款单</span>
                                    </div>
                                </template>
                                <div id="requestFundsContainer" class="request-funds-container">
                                    <div class="request-funds-header">
                                        <div class="left">
                                            <div class="desc">详情信息</div>
                                            <img :src="scope.row.qrCode" width="60" height="60" alt="二维码"/>
                                            <div class="desc">扫码查看</div>
                                        </div>
                                        <h3 class="request-funds-title"
                                            @dblclick="downloadPdf('requestFundsContainer','员工请款单',scope.row.status,scope.row.isOwner)">
                                            员工请款单
                                        </h3>
                                        <div class="right">
                                            <p><b>部门：</b>{{ scope.row.deptName }}</p>
                                            <p><b>日期：</b>{{ dayjs(scope.row.createTime).format('YYYY/MM/DD') }}
                                            </p>
                                        </div>
                                    </div>
                                    <table class="request-funds-table">
                                        <tbody>
                                        <tr>
                                            <th>请款人</th>
                                            <td>{{ scope.row.name }}</td>
                                            <th>部门</th>
                                            <td>{{ scope.row.deptName }}</td>
                                            <th>职务</th>
                                            <td>{{ scope.row.jobName }}</td>
                                        </tr>
                                        <tr>
                                            <th>请款理由</th>
                                            <td colspan="5" class="left">
                                                <div class="reason">{{ scope.row.reason }}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th class="rowspan-top">
                                                <div class="label">请款金额</div>
                                            </th>
                                            <td colspan="5" class="left">
                                                <span>人民币（大写）：{{
                                                        numberToChineseUppercaseCurrency(scope.row.amount)
                                                    }}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th class="rowspan-bottom"></th>
                                            <td colspan="5" class="left">
                                                <div class="input-amount-container">
                                                    <span>人民币（小写）：{{ scope.row.amount }}元</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>付款方式</th>
                                            <td colspan="3" class="left">
                                                <span class="checkbox">转账</span>
                                                <span class="checkbox">现金</span>
                                                <span class="checkbox">支票</span>
                                            </td>
                                            <th>付款日期</th>
                                            <td></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <ul class="request-funds-footer"
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
            <el-table-column prop="name" header-align="center" align="center" label="请款人" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="deptName" header-align="center" align="center" label="所属部门" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="amount" header-align="center" align="center" label="请款金额" min-width="150"/>
            <el-table-column prop="reason" header-align="center" align="center" label="请款理由" min-width="220"/>
            <el-table-column prop="status" header-align="center" align="center" label="执行状态" min-width="150"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="230" label="操作">
                <template #default="scope">
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['REQUEST_FUNDS:ARCHIVE'])||scope.row.status!='已批准'"
                               @click="showArchiveDialog(scope.row.id,scope.row.instanceId)">
                        归档
                    </el-button>
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['REQUEST_FUNDS:LOAD'])||scope.row.status!='已归档'"
                               @click="showArchiveImageDrawer(scope.row.id,scope.row.image)">
                        查档
                    </el-button>
                    <el-button type="primary" :disabled="scope.row.isOwner==false||scope.row.status=='已归档'"
                               @click="deleteTableRows(scope.row.id,scope.row.instanceId)" link>
                        撤销
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="pageSizeChange" @current-change="pageIndexChange"
                       :current-page="tableData.pageIndex" :page-sizes="[10, 20, 50]" :page-size="tableData.pageSize"
                       :total="tableData.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
        <el-dialog title="请款申请" v-model="requestFundsDialog.visible" width="450" :close-on-click-modal="false">
            <el-form ref="requestFundsDialogForm" :model="requestFundsDialog.formData" :rules="requestFundsDialog.rule"
                     label-width="80px">
                <el-form-item label="请款金额" prop="amount">
                    <el-input v-model="requestFundsDialog.formData.amount" placeholder="请款金额" class="dialog-input"/>
                    <span class="dialog-input-description">精确到两位小数，单位：元</span>
                </el-form-item>
                <el-form-item label="请款理由" prop="reason">
                    <el-input type="textarea" v-model="requestFundsDialog.formData.reason" placeholder="请款理由"
                              :rows="4" maxlength="350"/>
                </el-form-item>
            </el-form>
            <div class="tip">
                <el-alert title="注意事项" type="warning" :closable="false" show-icon
                          description="请款人只需要填写“请款理由”和“请款金额”的人民币金额小写即可，其他信息无需填写。请款申请单一经提交，将由申请人所在部门以及财务部进行审核，最终审批结果将在邮件中通知。"
                />
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="requestFundsDialog.visible = false">取消</el-button>
                    <el-button type="primary" @click="saveSubmit()">提交请款单</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog title="执行归档" v-model="archiveDialog.visible" width="450" :close-on-click-modal="false"
                   v-if="proxy.isAuth(['REQUEST_FUNDS:ARCHIVE'])" @closed="archiveDialogClosed">
            <div class="tip">
                <el-alert type="warning" :closable="false"
                          description="请将需要归档的文件拍照并上传，归档后将无法修改，请谨慎操作。"
                          show-icon/>
                <el-upload ref="uploadArchiveImageUploader" class="upload" accept=".jpg,.jpeg"
                           :action="archiveDialog.url"
                           v-model:file-list="archiveDialog.formData.imageList" list-type="picture"
                           :limit="1" :on-exceed="uploadArchiveImageExceed" :auto-upload="false"
                           :headers="{'token':token}" name="file"
                           :data="{'id':archiveDialog.formData.id, 'instanceId':archiveDialog.formData.instanceId}"
                           :before-upload="beforeUploadImage"
                           :on-success="uploadArchiveImageSuccess"
                           :on-error="uploadArchiveImageError">
                    <template #trigger>
                        <el-button type="primary" :icon="Picture">选择请款单的照片</el-button>
                    </template>
                </el-upload>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="danger" @click="archiveDialog.visible = false">关闭</el-button>
                    <el-button type="primary" @click="archiveSubmit()">归档</el-button>
                </span>
            </template>
        </el-dialog>
        <el-drawer v-model="archiveImageDrawer.visible" v-if="proxy.isAuth(['REQUEST_FUNDS:ARCHIVE','REQUEST_FUNDS:LOAD'])"
                   size="508" title="已归档的照片" :direction="archiveImageDrawer.direction"
                   @closed="archiveImageDrawerClosed">
            <el-upload ref="updateArchiveImageUploader" accept=".jpg,.jpeg" :action="archiveImageDrawer.url"
                       v-model:file-list="archiveImageDrawer.formData.imageList" list-type="picture-card"
                       :limit="1" :on-exceed="updateArchiveImageExceed" :auto-upload="false"
                       :headers="{'token':token}" name="file"
                       :data="{'id':archiveImageDrawer.formData.id}"
                       :before-upload="beforeUploadImage"
                       :on-preview="previewArchiveImage"
                       :on-success="updateArchiveImageSuccess">
                <el-icon>
                    <Plus/>
                </el-icon>
            </el-upload>
            <el-dialog v-model="archiveImageDrawer.previewVisible" width="750">
                <img :src="archiveImageDrawer.previewImage" width="700" alt="预览归档图片"/>
            </el-dialog>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="archiveImageDrawer.visible = false">取消</el-button>
                    <el-button type="primary" @click="updateArchiveImageSubmit"
                               :disabled="!proxy.isAuth(['REQUEST_FUNDS:ARCHIVE'])">更新归档图片
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
import $ from "jquery";
import {numberToChineseUppercaseCurrency} from "pixiu-number-toolkit";

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

const requestFundsDialog = reactive({
    visible: false,
    formData: {
        reason: null,
        amount: null
    },
    rule: {
        amount: [
            {required: true, message: "请输入请款金额", trigger: "blur"},
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
        ],
        reason: [
            {required: true, message: "请输入请款理由", trigger: "blur"}
        ]
    }
});

const archiveDialog = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/request/funds/archive",
    formData: {
        id: null,
        imageList: []
    }
});

const archiveImageDrawer = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/request/funds/update-archive-image",
    direction: 'rtl',
    formData: {
        id: null,
        imageList: []
    },
    previewVisible: false,
    previewImage: null
})

const token = ref(localStorage.getItem('token'))

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
    proxy.$http("/mis/request/funds/search-by-page", "POST", data, true, resp => {
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
                one.image = proxy.$minioUrl + "/" + one.image;
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
        row.activeName = "requestFundsTab"
        let data = {
            instanceId: row.instanceId
        };
        proxy.$http('/mis/request/funds/search-approval-info', 'POST', data, false, function (resp) {
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


function showRequestFundsDialog() {
    requestFundsDialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.requestFundsDialogForm.resetFields();
    })

}

function saveSubmit() {
    proxy.$refs.requestFundsDialogForm.validate((valid) => {
        if (valid) {
            let data = {
                reason: requestFundsDialog.formData.reason,
                amount: requestFundsDialog.formData.amount,
            }
            proxy.$http("/mis//request/funds/create-request-funds", "POST", data, true, function (resp) {
                let result = resp.result;
                if (result.status === "SUCCESS") {
                    proxy.$message({
                        type: "success",
                        message: "成功提交请款申请",
                        duration: 1200,
                        onClose: () => {
                            requestFundsDialog.visible = false;
                            loadTableData();
                        }
                    });
                }
            })
        }
    })
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

function deleteTableRows(id,instanceId) {
    proxy.$confirm('确认撤销该条请款记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const data = {
            "id": id,
            "instanceId": instanceId
        }
        proxy.$http("/mis/request/funds/delete-by-id", "POST", data, true, resp => {
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


function uploadArchiveImageExceed(files) {
    let uploader = proxy.$refs.uploadArchiveImageUploader
    uploader.clearFiles()
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

function archiveSubmit() {
    if (archiveDialog.formData.imageList.length === 0) {
        proxy.$message({
            type: 'error',
            message: '请选择归档照片',
            duration: 1200
        })
    }
    else {
        let uploader = proxy.$refs.uploadArchiveImageUploader
        uploader.submit()
    }
}

function uploadArchiveImageSuccess(resp: any, file: UploadFile, fileList: UploadFile[]) {
    if (resp.code === "200" && resp.result.status === "SUCCESS") {
        proxy.$message({
            type: 'success',
            message: '归档执行成功',
            duration: 1200,
            onClose: () => {
                archiveDialog.visible = false;
                tableData.expands = [];
                loadTableData()
            }
        })
    }
    else {
        proxy.$message({
            type: 'error',
            message: '归档执行失败',
            duration: 1200,
            onClose: () => {
                archiveDialog.visible = false;
            }
        })
    }
}

function uploadArchiveImageError(error: any, file: UploadFile, fileList: UploadFile[]) {
    proxy.$message({
        type: 'error',
        message: '归档执行失败',
        duration: 1200,
        onClose: () => {
            archiveDialog.visible = false;
        }
    })
}

function showArchiveImageDrawer(id, image) {
    archiveImageDrawer.formData.id = id;
    archiveImageDrawer.formData.imageList = [
        {url: image}
    ];
    archiveImageDrawer.visible = true;
}

function previewArchiveImage(uploadFile) {
    archiveImageDrawer.previewImage = uploadFile.url
    archiveImageDrawer.previewVisible = true
}

function updateArchiveImageExceed(files) {
    let uploader = proxy.$refs.updateArchiveImageUploader
    uploader.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    //只能上传一张照片，替换掉原来的照片
    uploader.handleStart(file)
}

function updateArchiveImageSubmit() {
    if (archiveImageDrawer.formData.imageList.length === 0) {
        proxy.$message({
            type: 'error',
            message: '请选择归档照片',
            duration: 1200
        })
    }
    else {
        let uploader = proxy.$refs.updateArchiveImageUploader
        uploader.submit()
    }
}

function updateArchiveImageSuccess() {
    proxy.$message({
        type: 'success',
        message: '更新归档照片成功',
        duration: 1200,
        onClose: () => {
            archiveImageDrawer.visible = false;
            //更新当前记录的image属性值为最新上传的照片
            tableData.dataList.forEach(one => {
                if (one.id === archiveImageDrawer.formData.id) {
                    one.image = archiveImageDrawer.formData.imageList[0].url
                }
            })
        }
    })

}

function archiveImageDrawerClosed() {
    archiveImageDrawer.formData.id = null;
    archiveImageDrawer.formData.imageList = [];
}
</script>
<style scoped lang="scss">
@use "request-funds";
</style>