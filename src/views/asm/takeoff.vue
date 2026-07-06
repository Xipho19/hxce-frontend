<template>
    <div id="user-takeoff">
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
                <el-select v-model="formData.typeId" placeholder="请假类型" class="search-input" clearable="clearable">
                    <el-option label="病假" value="1"/>
                    <el-option label="事假" value="2"/>
                    <el-option label="换休假" value="3"/>
                    <el-option label="年假" value="4"/>
                    <el-option label="其他" value="5"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-date-picker type="daterange" v-model="formData.dateRange" start-placeholder="起始日期"
                                range-separator="~" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                                class="search-input-daterange"/>
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
                <el-button type="success" icon="Edit" @click="showTakeoffDialog()"
                           :disabled="formData.isSystemicRole=='true'">
                    我要请假
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
                            <el-tab-pane name="takeoffTab">
                                <template #label>
                                    <div class="custom-tabs-label">
                                        <el-icon size="15">
                                            <Tickets/>
                                        </el-icon>
                                        <span> 请假单</span>
                                    </div>
                                </template>
                                <div id="takeoffContainer" class="takeoff-container">
                                    <div class="takeoff-header">
                                        <div class="left">
                                            <div class="desc">详情信息</div>
                                            <img :src="scope.row.qrCode" width="60" height="60" alt="二维码"/>
                                            <div class="desc">扫码查看</div>
                                        </div>
                                        <h3 class="takeoff-title"
                                            @dblclick="downloadPdf('takeoffContainer','员工请假单',scope.row.status,scope.row.isOwner)">
                                            员工请假单
                                        </h3>
                                        <div class="right">
                                            <p><b>部门：</b>{{ scope.row.deptName }}</p>
                                            <p><b>日期：</b>{{ dayjs(scope.row.createTime).format('YYYY/MM/DD') }}
                                            </p>
                                        </div>
                                    </div>
                                    <table class="takeoff-table">
                                        <tbody>
                                        <tr>
                                            <th>请假人</th>
                                            <td>{{ scope.row.name }}</td>
                                            <th>性别</th>
                                            <td>{{ scope.row.gender }}</td>
                                            <th>手机号码</th>
                                            <td>{{ scope.row.tel }}</td>
                                        </tr>
                                        <tr>
                                            <th>部门名称</th>
                                            <td>{{ scope.row.deptName }}</td>
                                            <th>职务</th>
                                            <td>{{ scope.row.jobName }}</td>
                                            <th>请假类型</th>
                                            <td>{{ scope.row.type }}</td>
                                        </tr>
                                        <tr>
                                            <th>请假天数</th>
                                            <td>{{ scope.row.days }}天</td>
                                            <th>日期范围</th>
                                            <td colspan="3" class="left">
                                                {{ dayjs(scope.row.startDate).format('YYYY年MM月DD日') }}&nbsp;&nbsp;~&nbsp;&nbsp;
                                                {{ dayjs(scope.row.endDate).format('YYYY年MM月DD日') }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>请假事由</th>
                                            <td colspan="5" class="left">
                                                <div class="takeoff-content">
                                                    {{ scope.row.content }}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>本人签字</th>
                                            <td></td>
                                            <th>部门经理签字</th>
                                            <td></td>
                                            <th>总经理签字</th>
                                            <td></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <p class="takeoff-remark">
                                        备注说明：员工请假期间一切人身安全由该员工本人负责，公司不承担任何责任。假期结束后员工应及时返岗，并且公司不负责返岗费用。如不返岗工作，按照旷工处理。旷工1天扣发1.5倍日工资；旷工超过3~5天扣发半月工资，自动取消本年度评优与年假；旷工超过5天予以辞退处理，并且扣发当月工资与奖金。
                                    </p>
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
            <el-table-column prop="name" header-align="center" align="center" label="请假人" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="deptName" header-align="center" align="center" label="所属部门" min-width="200"
                             show-overflow-tooltip/>
            <el-table-column prop="startDate" header-align="center" align="center" label="起始日期" min-width="150"/>
            <el-table-column prop="endDate" header-align="center" align="center" label="结束日期" min-width="150"/>
            <el-table-column header-align="center" align="center" label="请假天数" min-width="150">
                <template #default="scope">
                    <span>{{ scope.row.days }}天</span>
                </template>
            </el-table-column>
            <el-table-column prop="type" header-align="center" align="center" label="请假类型" min-width="150"
                             show-overflow-tooltip/>
            <el-table-column prop="status" header-align="center" align="center" label="执行状态" min-width="150"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="230" label="操作">
                <template #default="scope">
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['TAKEOFF:ARCHIVE'])||scope.row.status!='已批准'"
                               @click="showArchiveDialog(scope.row.id,scope.row.instanceId)">
                        归档
                    </el-button>
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['TAKEOFF:LOAD'])||scope.row.status!='已归档'"
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
        <el-dialog title="在线请假" v-model="takeoffDialog.visible" width="450" :close-on-click-modal="false">
            <el-form ref="takeoffDialogForm" :model="takeoffDialog.formData" :rules="takeoffDialog.rule"
                     label-width="80px">
                <el-form-item label="日期范围" prop="dateRange">
                    <el-date-picker type="daterange" v-model="takeoffDialog.formData.dateRange"
                                    start-placeholder="起始日期"
                                    range-separator="~" end-placeholder="结束日期" value-format="YYYY-MM-DD" clearable/>
                </el-form-item>
                <el-form-item label="请假天数" prop="days">
                    <el-input v-model="takeoffDialog.formData.days" placeholder="请假天数" class="dialog-input"
                              clearable/>
                    <span class="dialog-input-description">例如半天用0.5表示</span>
                </el-form-item>
                <el-form-item label="请假类型" prop="typeId">
                    <el-select v-model="takeoffDialog.formData.typeId" placeholder="请假类型" class="dialog-input"
                               clearable>
                        <el-option label="病假" value="1"/>
                        <el-option label="事假" value="2"/>
                        <el-option label="换休假" value="3"/>
                        <el-option label="年假" value="4"/>
                        <el-option label="婚假" value="5"/>
                        <el-option label="产假" value="6"/>
                        <el-option label="丧假" value="7"/>
                        <el-option label="其他" value="8"/>
                    </el-select>
                    <span class="dialog-input-description">换休假需要说明换休原因</span>
                </el-form-item>
                <el-form-item label="请假事由" prop="content">
                    <el-input type="textarea" v-model="takeoffDialog.formData.content" placeholder="请假原因" :rows="4"
                              maxlength="350"/>
                </el-form-item>
            </el-form>
            <div class="tip">
                <el-alert title="注意事项" type="warning" :closable="false" show-icon
                          description="请假申请创建之后将无法修改，请慎重填写。如果请假申请填写错误，可以点击“撤销”按钮，将请假申请撤销，重新提交新的请假申请。"
                />
            </div>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="takeoffDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="saveSubmit()">确定</el-button>
            </span>
            </template>
        </el-dialog>
        <el-dialog title="执行归档" v-model="archiveDialog.visible" width="450" :close-on-click-modal="false"
                   v-if="proxy.isAuth(['TAKEOFF:ARCHIVE'])" @closed="archiveDialogClosed">
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
                        <el-button type="primary" :icon="Picture">选择请假单的照片</el-button>
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
        <el-drawer v-model="archiveImageDrawer.visible"
                   v-if="proxy.isAuth(['TAKEOFF:ARCHIVE','TAKEOFF:LOAD'])"
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
                               :disabled="!proxy.isAuth(['TAKEOFF:ARCHIVE'])">更新归档图片
                    </el-button>
                </div>
            </template>
        </el-drawer>
    </div>
</template>
<script setup lang="ts">
import {ref, reactive, getCurrentInstance} from 'vue';
import {dayjs, genFileId} from "element-plus";
import {Search, Plus, Delete, Edit, Picture, Tickets, Memo} from "@element-plus/icons-vue";
import {numberToChineseUppercaseCurrency} from "pixiu-number-toolkit";
import QRCode from 'qrcode';
import $ from "jquery";

const {proxy} = getCurrentInstance();

/** 响应对象区域 *********************************************************/

const formData = reactive({
    name: null,
    deptId: null,
    deptList: [],
    typeId: null,
    dateRange: [],
    status: null,
    code: null,
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


const takeoffDialog = reactive({
    visible: false,
    formData: {
        dateRange: null,
        days: null,
        typeId: null,
        content: null,
    },
    rule: {
        dateRange: [
            {required: true, message: "请选择日期范围"}
        ],
        days: [
            {required: true, message: "请输入请假天数"},
            {pattern: "^(0\\.5|[1-9][0-9]*(\\.5)?)$", message: "请假天数错误", trigger: "blur"},
            {
                validator: (rule, value, callback) => {
                    if (takeoffDialog.formData.dateRange == null || takeoffDialog.formData.dateRange.length !== 2) {
                        callback(new Error("请选择日期范围"))
                    }
                    let startDate = dayjs(takeoffDialog.formData.dateRange[0])
                    let endDate = dayjs(takeoffDialog.formData.dateRange[1])
                    let betweenDays = endDate.diff(startDate, "days") + 1
                    if (Number.isInteger(value)) {
                        if (value < 1 || value > betweenDays) {
                            callback(new Error("请假天数不正确"))
                        }
                        else {
                            callback();
                        }
                    }
                    else {
                        if (value < 0.5 || value > betweenDays) {
                            callback(new Error("请假天数不正确"))
                        }
                        else {
                            callback();
                        }
                    }
                }, trigger: "blur"
            }
        ],
        typeId: [
            {required: true, message: "选择请假类型"}
        ],
        content: [
            {required: true, message: "请输入请假事由", trigger: "blur"}
        ]
    }
});

const archiveDialog = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/user/takeoff/archive",
    formData: {
        id: null,
        imageList: []
    }
});

const archiveImageDrawer = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/user/takeoff/update-archive-image",
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
        typeId: formData.typeId,
        startDate: formData.dateRange ? formData.dateRange[0] : null,
        endDate: formData.dateRange ? formData.dateRange[1] : null,
        status: formData.status,
        code: formData.code,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/user/takeoff/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            let list = page.list;
            let typeJson = {
                "1": "病假",
                "2": "事假",
                "3": "换休假",
                "4": "年假",
                "5": "婚假",
                "6": "产假",
                "7": "丧假",
                "8": "其他"
            }
            let statusJson = {
                "1": "申请中",
                "2": "已批准",
                "3": "已否决",
                "4": "已归档"
            }
            list.forEach(one => {
                one.type = typeJson[one.typeId]
                one.status = statusJson[one.status]
                one.image = proxy.$minioUrl + "/" + one.image
            })
            tableData.dataList = list;
            tableData.totalCount = Number(page.totalCount);
            tableData.loading = false;
        }
    })
}

loadTableData()

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

function expand(row, expandedRows) {
    if (expandedRows.length > 0) {
        tableData.expands = [];
        row.activeName = "takeoffTab"
        let data = {
            instanceId: row.instanceId
        };
        proxy.$http('/mis/user/takeoff/search-approval-info', 'POST', data, false, function (resp) {
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

function showTakeoffDialog() {
    takeoffDialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.takeoffDialogForm.resetFields();
    })
}

function saveSubmit() {
    proxy.$refs.takeoffDialogForm.validate((valid) => {
        if (valid) {
            const data = {
                startDate: takeoffDialog.formData.dateRange[0],
                endDate: takeoffDialog.formData.dateRange[1],
                days: takeoffDialog.formData.days,
                typeId: takeoffDialog.formData.typeId,
                content: takeoffDialog.formData.content
            }
            proxy.$http("/mis/user/takeoff/create-takeoff", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    proxy.$message({
                        type: "success",
                        message: "成功提交请假申请",
                        duration: 1200,
                        onClose: () => {
                            takeoffDialog.visible = false;
                            loadTableData();
                        }
                    });
                }
            })
        }
    })
}

function deleteTableRows(id, instanceId) {
    proxy.$confirm("确认撤销该条请假记录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        const data = {
            "id": id,
            "instanceId": instanceId
        }
        proxy.$http("/mis/user/takeoff/delete-by-id", "POST", data, true, resp => {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                proxy.$message({
                    message: "撤销成功",
                    type: "success",
                    duration: 1200,
                    onClose: () => {
                        loadTableData();
                    }
                });
            }
            else {
                proxy.$message({
                    type: "error",
                    message: "撤销失败",
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
@use "takeoff";
</style>
