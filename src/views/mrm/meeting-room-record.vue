<template>
    <div id="meetingRoomRecord">
        <el-form :inline="true" :model="formData" ref="form">
            <el-form-item>
                <el-select v-model="formData.meetingRoomId" placeholder="会议室" class="search-input"
                           clearable="clearable">
                    <el-option :label="one.label" :value="one.value" v-for="one in formData.meetingRoomList"/>
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
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="success" icon="Edit" @click="showApplicationDialog()"
                           :disabled="formData.isSystemicRole=='true'">
                    我要申请
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
                            <el-tab-pane name="applicationTab">
                                <template #label>
                                    <div class="custom-tabs-label">
                                        <el-icon size="15">
                                            <Tickets/>
                                        </el-icon>
                                        <span> 会议室申请表</span>
                                    </div>
                                </template>
                                <div id="applicationContainer" class="application-container">
                                    <h3 class="application-title">
                                        会议室申请表
                                    </h3>
                                    <table class="application-table">
                                        <tbody>
                                        <tr>
                                            <th>申请人</th>
                                            <td>{{ scope.row.name }}</td>
                                            <th>部门</th>
                                            <td>{{ scope.row.deptName }}</td>
                                            <th>职务</th>
                                            <td>{{ scope.row.jobName }}</td>
                                        </tr>
                                        <tr>
                                            <th>使用日期</th>
                                            <td>{{scope.row.date}}</td>
                                            <th>起始时间</th>
                                            <td>{{scope.row.startTime}}</td>
                                            <th>结束时间</th>
                                            <td>{{scope.row.endTime}}</td>
                                        </tr>
                                        <tr>
                                            <th>会议室</th>
                                            <td colspan="5" class="left">{{scope.row.meetingRoomName}}【上限{{scope.row.max}}人】</td>
                                        </tr>
                                        <tr>
                                            <th>申请事由</th>
                                            <td colspan="5" class="left">
                                                <div class="reason">{{ scope.row.reason }}</div>
                                            </td>
                                        </tr>

                                        </tbody>
                                    </table>
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
            <el-table-column prop="name" header-align="center" align="center" label="申请人" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="deptName" header-align="center" align="center" label="所属部门" min-width="200"
                             show-overflow-tooltip/>
            <el-table-column prop="meetingRoomName" header-align="center" align="center" label="会议室" min-width="200"
                             show-overflow-tooltip/>
            <el-table-column prop="date" header-align="center" align="center" label="使用日期" min-width="150"/>
            <el-table-column prop="startTime" header-align="center" align="center" label="起始时间" min-width="120"/>
            <el-table-column prop="endTime" header-align="center" align="center" label="结束时间" min-width="120"/>
            <el-table-column prop="status" header-align="center" align="center" label="执行状态" min-width="120"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="180" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="scope.row.isOwner==false"
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
        <el-dialog title="申请会议室" v-model="recordDialog.visible" width="450" :close-on-click-modal="false">
            <el-form ref="recordDialogForm" :model="recordDialog.formData" :rules="recordDialog.rule"
                     label-width="80px">
                <el-form-item label="会议室" prop="meetingRoomId">
                    <el-select v-model="recordDialog.formData.meetingRoomId" placeholder="会议室"
                               clearable="clearable">
                        <el-option :label="one.label+'【最多'+one.max+'人】'" :value="one.value"
                                   v-for="one in formData.meetingRoomList"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="使用日期" prop="date">
                    <el-date-picker v-model="recordDialog.formData.date" placeholder="使用日期"
                                    value-format="YYYY-MM-DD" :disabled-date="recordDialog.disabledDate" clearable/>
                    <span class="dialog-input-description">当日之后的日期</span>
                </el-form-item>
                <el-form-item label="起始时间" prop="startTime">
                    <el-input v-model="recordDialog.formData.startTime" placeholder="起始时间" class="dialog-input"
                              clearable/>
                    <span class="dialog-input-description">必须24小时制HH:mm格式</span>
                </el-form-item>
                <el-form-item label="结束时间" prop="endTime">
                    <el-input v-model="recordDialog.formData.endTime" placeholder="结束时间" class="dialog-input"
                              clearable/>
                    <span class="dialog-input-description">必须24小时制HH:mm格式</span>
                </el-form-item>

                <el-form-item label="申请事由" prop="reason">
                    <el-input type="textarea" v-model="recordDialog.formData.reason" placeholder="申请事由" :rows="4"
                              maxlength="300"/>
                </el-form-item>
            </el-form>
            <div class="tip">
                <el-alert title="注意事项" type="warning" :closable="false" show-icon
                          description="会议室申请创建之后将无法修改，请慎重填写。如果会议室申请填写错误，可以点击“撤销”按钮，将会议室申请撤销，重新提交新的会议室申请。"
                />
            </div>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="takeoffDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="saveSubmit()">确定</el-button>
            </span>
            </template>
        </el-dialog>
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
    meetingRoomList: [],
    meetingRoomId: null,
    dateRange: [],
    status: null,
    isSystemicRole: localStorage.getItem('isSystemicRole')
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

const recordDialog = reactive({
    visible: false,
    formData: {
        meetingRoomId: null,
        date: null,
        startTime: null,
        endTime: null,
        reason: null,
    },
    rule: {
        meetingRoomId: [
            {required: true, message: "请选择会议室"}
        ],
        date: [
            {required: true, message: "请选择日期"}
        ],
        startTime: [
            {required: true, message: "请输入起始时间"},
            {pattern: /^([01]?\d|2[0-3]):[0-5]?\d$/, message: "请输入正确的起始时间格式", trigger: "blur"}
        ],
        endTime: [
            {required: true, message: "请输入结束时间"},
            {pattern: /^([01]?\d|2[0-3]):[0-5]?\d$/, message: "请输入正确的结束时间格式", trigger: "blur"}
        ],
        reason: [
            {required: true, message: "请输入申请事由"}
        ]
    },
    disabledDate(date) {
        // 获取当前日期（去掉时间部分）
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 如果传入的日期小于当前日期，则禁用
        return date < today;
    }
});

/** 函数定义区域 *********************************************************/
function loadTableData() {
    tableData.loading = true;
    tableData.expands = [];
    const data = {
        meetingRoomId: formData.meetingRoomId,
        startDate: formData.dateRange ? formData.dateRange[0] : null,
        endDate: formData.dateRange ? formData.dateRange[1] : null,
        status: formData.status,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/meeting/room/record/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
            let tempStatus = {
                "1": "申请中",
                "2": "已批准",
                "3": "已否决"
            }
            page.list.forEach(one => {
                one.startTime = dayjs(one.startTime).format("HH:mm")
                one.endTime = dayjs(one.endTime).format("HH:mm")
                one.status = tempStatus[one.status]

            })
            tableData.dataList = page.list;
            tableData.totalCount = Number(page.totalCount);
            tableData.loading = false;
        }
    })
}

loadTableData();

function loadMeetingRoomList() {
    let data = {
        status: null
    }
    proxy.$http("/mis/meeting/room/search-all-meeting-room", "POST", data, true, function (resp) {
        let result = resp.result;
        let meetingRoomList = [];
        result.meetingRoomList.forEach(one => {
            meetingRoomList.push({
                value: one.id,
                label: one.name,
                max: one.max
            });
        });
        formData.meetingRoomList = meetingRoomList;
    })
}

loadMeetingRoomList();

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
        row.activeName = "applicationTab"
        let data = {
            instanceId: row.instanceId
        };
        proxy.$http('/mis/meeting/room/record/search-approval-info', 'POST', data, false, function (resp) {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                row.bpmnPicture = result.bpmnPicture
                let approvalList = result.approvalList;
                approvalList.forEach(one => {
                    one.completeTime = dayjs(one.completeTime).format("YYYY/MM/DD HH:mm")
                    one.approvalResult = (one.approvalResult ? "通过" : "否决")
                })
                row.approvalList = approvalList;

                tableData.expands.push(row.id);
            }
        });
    }
    else {
        tableData.expands = [];
    }
}

function showApplicationDialog() {
    recordDialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.recordDialogForm.resetFields();
    })
}

function saveSubmit() {
    proxy.$refs.recordDialogForm.validate((valid) => {
        if (valid) {
            //验证开始时间是不是在结束时间之前
            let startTime = dayjs(recordDialog.formData.startTime, "HH:mm");
            let endTime = dayjs(recordDialog.formData.endTime, "HH:mm");
            if (startTime.isAfter(endTime)) {
                proxy.$message.error("开始时间不能晚于结束时间");
                return;
            }
            const data = {
                meetingRoomId: recordDialog.formData.meetingRoomId,
                date: recordDialog.formData.date,
                startTime: recordDialog.formData.date + " " + recordDialog.formData.startTime,
                endTime: recordDialog.formData.date + " " + recordDialog.formData.endTime,
                reason: recordDialog.formData.reason
            }
            proxy.$http("/mis/meeting/room/record/create-application", "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    proxy.$message({
                        type: "success",
                        message: "成功提交会议室申请",
                        duration: 1200,
                        onClose: () => {
                            recordDialog.visible = false;
                            loadTableData();
                        }
                    });
                }
            })
        }
    })
}

function deleteTableRows(id,instanceId) {
    proxy.$confirm('确认撤销该条会议室申请记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const data = {
            "id": id,
            "instanceId": instanceId
        }
        proxy.$http("/mis/meeting/room/record/delete-by-id", "POST", data, true, resp => {
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
@use "meeting-room-record";
</style>