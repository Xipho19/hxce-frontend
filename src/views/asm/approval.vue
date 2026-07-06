<template>
    <div id="approval" v-if="proxy.isAuth(['ADMINISTRATIVE_APPROVAL:SELECT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item>
                <el-tree-select :data="formData.workflowTypeList" v-model="formData.workflowType" placeholder="审批类别"
                                class="search-input" clearable/>
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
            <el-form-item prop="name">
                <el-input v-model="formData.applicantName" placeholder="申请人" maxlength="50" class="search-input"
                          clearable="clearable"/>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.status" @change="searchByCondition()">
                    <el-radio-button value="待审批">待审批</el-radio-button>
                    <el-radio-button value="已审批">已审批</el-radio-button>
                    <el-radio-button value="已结束">已结束</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList" :header-cell-style="{'background':'#f5f7fa','padding':'10px 0 !important'}"
                  v-loading="tableData.loading" :scrollbar-always-on="false"
                  @expand-change="expand" :row-key="tableData.getRowKeys" :expand-row-keys="tableData.expands" border>
            <el-table-column type="expand">
                <template #default="scope">
                    <div class="expand-content">
                        <div v-if="scope.row.workflowType == '员工请假'" id="userTakeoff">
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
                                    <div class="takeoff-container">
                                        <div class="takeoff-title">
                                            <h3>员工请假单</h3>
                                        </div>
                                        <table class="takeoff-table">
                                            <tbody>
                                            <tr>
                                                <th>请假人</th>
                                                <td>{{ scope.row.applicantName }}</td>
                                                <th>性别</th>
                                                <td>{{ scope.row.applicantGender }}</td>
                                                <th>手机号码</th>
                                                <td>{{ scope.row.applicantTel }}</td>
                                            </tr>
                                            <tr>
                                                <th>部门名称</th>
                                                <td>{{ scope.row.applicantDeptName }}</td>
                                                <th>职务</th>
                                                <td>{{ scope.row.applicantJobName }}</td>
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
                                        <el-image :src="scope.row.bpmnPicture"
                                                  :preview-src-list="[scope.row.bpmnPicture]"
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
                        <div v-if="scope.row.workflowType == '差旅费报销'" id="travelExpense">
                            <div class="container">
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
                                        <div class="travel-expense-container">
                                            <div class="reimburse-title">
                                                <h3>差旅费报销单</h3>
                                            </div>
                                            <table class="travel-expense-table">
                                                <tbody>
                                                <tr>
                                                    <th colspan="2">出差人</th>
                                                    <td colspan="4" class="left">
                                                        {{ scope.row.applicantName }}
                                                    </td>
                                                    <th colspan="2">出差事由</th>
                                                    <td colspan="6" class="left" id="reason">
                                                        {{ scope.row.reason }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">出发</th>
                                                    <th colspan="4">到达</th>
                                                    <th colspan="1" class="rowspan-top">
                                                        <div class="label">交通工具</div>
                                                    </th>
                                                    <th colspan="1" class="rowspan-top">
                                                        <div class="label">交通费</div>
                                                    </th>
                                                    <th colspan="2">出差补贴</th>
                                                    <th colspan="2">其他费用</th>
                                                </tr>
                                                <tr>
                                                    <th>月</th>
                                                    <th>日</th>
                                                    <th>时</th>
                                                    <th>地点</th>
                                                    <th>月</th>
                                                    <th>日</th>
                                                    <th>时</th>
                                                    <th>地点</th>
                                                    <th class="rowspan-bottom"></th>
                                                    <th class="rowspan-bottom"></th>
                                                    <th>天数</th>
                                                    <th>金额</th>
                                                    <th>项目</th>
                                                    <th>金额</th>
                                                </tr>
                                                <tr>
                                                    <td>{{ scope.row.travelList[0].startMonth }}</td>
                                                    <td>{{ scope.row.travelList[0].startDate }}</td>
                                                    <td>{{ scope.row.travelList[0].startHour }}</td>
                                                    <td>{{ scope.row.travelList[0].startPlace }}</td>
                                                    <td>{{ scope.row.travelList[0].endMonth }}</td>
                                                    <td>{{ scope.row.travelList[0].endDate }}</td>
                                                    <td>{{ scope.row.travelList[0].endHour }}</td>
                                                    <td>{{ scope.row.travelList[0].endPlace }}</td>
                                                    <td>{{ scope.row.travelList[0].vehicle }}</td>
                                                    <td>{{ scope.row.travelList[0].fare }}</td>
                                                    <td>{{ scope.row.subsidyList[0].days }}</td>
                                                    <td>{{ scope.row.subsidyList[0].subsidy }}</td>
                                                    <th>住宿费</th>
                                                    <td>￥{{ scope.row.accommodationExpense }}元</td>
                                                </tr>
                                                <tr>
                                                    <td>{{ scope.row.travelList[1].startMonth }}</td>
                                                    <td>{{ scope.row.travelList[1].startDate }}</td>
                                                    <td>{{ scope.row.travelList[1].startHour }}</td>
                                                    <td>{{ scope.row.travelList[1].startPlace }}</td>
                                                    <td>{{ scope.row.travelList[1].endMonth }}</td>
                                                    <td>{{ scope.row.travelList[1].endDate }}</td>
                                                    <td>{{ scope.row.travelList[1].endHour }}</td>
                                                    <td>{{ scope.row.travelList[1].endPlace }}</td>
                                                    <td>{{ scope.row.travelList[1].vehicle }}</td>
                                                    <td>{{ scope.row.travelList[1].fare }}</td>
                                                    <td>{{ scope.row.subsidyList[1].days }}</td>
                                                    <td>{{ scope.row.subsidyList[1].subsidy }}</td>
                                                    <th>市内车费</th>
                                                    <td>￥{{ scope.row.localTravelExpense }}元</td>
                                                </tr>
                                                <tr>
                                                    <td>{{ scope.row.travelList[2].startMonth }}</td>
                                                    <td>{{ scope.row.travelList[2].startDate }}</td>
                                                    <td>{{ scope.row.travelList[2].startHour }}</td>
                                                    <td>{{ scope.row.travelList[2].startPlace }}</td>
                                                    <td>{{ scope.row.travelList[2].endMonth }}</td>
                                                    <td>{{ scope.row.travelList[2].endDate }}</td>
                                                    <td>{{ scope.row.travelList[2].endHour }}</td>
                                                    <td>{{ scope.row.travelList[2].endPlace }}</td>
                                                    <td>{{ scope.row.travelList[2].vehicle }}</td>
                                                    <td>{{ scope.row.travelList[2].fare }}</td>
                                                    <td>{{ scope.row.subsidyList[2].days }}</td>
                                                    <td>{{ scope.row.subsidyList[2].subsidy }}</td>
                                                    <th>其他</th>
                                                    <td>￥{{ scope.row.otherExpense }}元</td>
                                                </tr>
                                                <tr>
                                                    <td>{{ scope.row.travelList[3].startMonth }}</td>
                                                    <td>{{ scope.row.travelList[3].startDate }}</td>
                                                    <td>{{ scope.row.travelList[3].startHour }}</td>
                                                    <td>{{ scope.row.travelList[3].startPlace }}</td>
                                                    <td>{{ scope.row.travelList[3].endMonth }}</td>
                                                    <td>{{ scope.row.travelList[3].endDate }}</td>
                                                    <td>{{ scope.row.travelList[3].endHour }}</td>
                                                    <td>{{ scope.row.travelList[3].endPlace }}</td>
                                                    <td>{{ scope.row.travelList[3].vehicle }}</td>
                                                    <td>{{ scope.row.travelList[3].fare }}</td>
                                                    <td>{{ scope.row.subsidyList[3].days }}</td>
                                                    <td>{{ scope.row.subsidyList[3].subsidy }}</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>{{ scope.row.travelList[4].startMonth }}</td>
                                                    <td>{{ scope.row.travelList[4].startDate }}</td>
                                                    <td>{{ scope.row.travelList[4].startHour }}</td>
                                                    <td>{{ scope.row.travelList[4].startPlace }}</td>
                                                    <td>{{ scope.row.travelList[4].endMonth }}</td>
                                                    <td>{{ scope.row.travelList[4].endDate }}</td>
                                                    <td>{{ scope.row.travelList[4].endHour }}</td>
                                                    <td>{{ scope.row.travelList[4].endPlace }}</td>
                                                    <td>{{ scope.row.travelList[4].vehicle }}</td>
                                                    <td>{{ scope.row.travelList[4].fare }}</td>
                                                    <td>{{ scope.row.subsidyList[4].days }}</td>
                                                    <td>{{ scope.row.subsidyList[4].subsidy }}</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>{{ scope.row.travelList[5].startMonth }}</td>
                                                    <td>{{ scope.row.travelList[5].startDate }}</td>
                                                    <td>{{ scope.row.travelList[5].startHour }}</td>
                                                    <td>{{ scope.row.travelList[5].startPlace }}</td>
                                                    <td>{{ scope.row.travelList[5].endMonth }}</td>
                                                    <td>{{ scope.row.travelList[5].endDate }}</td>
                                                    <td>{{ scope.row.travelList[5].endHour }}</td>
                                                    <td>{{ scope.row.travelList[5].endPlace }}</td>
                                                    <td>{{ scope.row.travelList[5].vehicle }}</td>
                                                    <td>{{ scope.row.travelList[5].fare }}</td>
                                                    <td>{{ scope.row.subsidyList[5].days }}</td>
                                                    <td>{{ scope.row.subsidyList[5].subsidy }}</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <th colspan="9"></th>
                                                    <th id="fareSum">￥{{
                                                            scope.row.travelCostAmount
                                                        }}元
                                                    </th>
                                                    <th></th>
                                                    <th id="subsidySum">￥{{
                                                            scope.row.travelSubsidyAmount
                                                        }}元
                                                    </th>
                                                    <th></th>
                                                    <th id="otherSum">￥{{ scope.row.otherAmount }}元</th>
                                                </tr>

                                                <tr>
                                                    <th colspan="2" class="rowspan-top">
                                                        <div class="label">报销总额</div>
                                                    </th>
                                                    <th colspan="6" class="left" id="reimburseTotalAmount">
                                                        人民币￥：{{ scope.row.totalAmount }}元
                                                    </th>
                                                    <th colspan="1" class="rowspan-top">
                                                        <div class="label">预借旅费</div>
                                                    </th>
                                                    <td colspan="2" class="rowspan-top" id="loanAmount">
                                                        <div class="label">￥{{ scope.row.loanAmount }}元</div>
                                                    </td>
                                                    <th colspan="1">补领金额</th>
                                                    <th colspan="2" class="left" id="replenishmentAmount">
                                                        {{ scope.row.replenishmentAmount }}
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th colspan="2" class="rowspan-bottom"></th>
                                                    <th colspan="6" class="left" id="reimburseChineseTotalAmount">
                                                        大写：{{
                                                            numberToChineseUppercaseCurrency(scope.row.totalAmount)
                                                        }}
                                                    </th>
                                                    <th class="rowspan-bottom"></th>
                                                    <td colspan="2" class="rowspan-bottom"></td>
                                                    <th colspan="1">退还金额</th>
                                                    <th colspan="2" class="left" id="refundAmount">{{
                                                            scope.row.refundAmount
                                                        }}
                                                    </th>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="local-travel-expense-container"
                                             v-if="scope.row.localTravelList.length > 0">
                                            <div class="reimburse-title">
                                                <h3>市内交通报销单</h3>
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
                                                <tr v-for="one in scope.row.localTravelList" :key="i">
                                                    <td>{{ one.date }}
                                                    </td>
                                                    <td>{{ one.time }}
                                                    </td>
                                                    <td>{{ one.route }}
                                                    </td>
                                                    <td>{{ one.reason }}
                                                    </td>
                                                    <td>{{ one.amount }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th colspan="2">金额合计（小写）</th>
                                                    <th colspan="3" id="localTravelTotalAmount" class="left">
                                                        人民币￥：{{ scope.row.localTravelExpense }}元
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th colspan="2">合计金额（大写）</th>
                                                    <th colspan="3" id="localTravelChineseTotalAmount" class="left">
                                                        人民币￥：{{
                                                            numberToChineseUppercaseCurrency(scope.row.localTravelExpense)
                                                        }}
                                                    </th>
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
                                            <el-image :src="scope.row.bpmnPicture"
                                                      :preview-src-list="[scope.row.bpmnPicture]"
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
                        </div>
                        <div v-if="scope.row.workflowType == '员工请款'" id="requestFunds">
                            <div class="container">
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
                                        <div class="request-funds-container">
                                            <div class="request-funds-title">
                                                <h3>员工请款单</h3>
                                            </div>
                                            <table class="request-funds-table">
                                                <tbody>
                                                <tr>
                                                    <th>请款人</th>
                                                    <td>{{ scope.row.applicantName }}</td>
                                                    <th>部门</th>
                                                    <td>{{ scope.row.applicantDeptName }}</td>
                                                    <th>职务</th>
                                                    <td>{{ scope.row.applicantJobName }}</td>
                                                </tr>

                                                <tr>
                                                    <th>请款理由</th>
                                                    <td colspan="5" class="left reason">{{ scope.row.reason }}</td>
                                                </tr>

                                                <tr>
                                                    <th rowspan="2">请款金额</th>
                                                    <td colspan="5" class="left">
                                                        <span>人民币（大写）：{{
                                                                numberToChineseUppercaseCurrency(scope.row.amount)
                                                            }}</span>
                                                    </td>
                                                </tr>
                                                <tr>
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
                                            <el-image :src="scope.row.bpmnPicture"
                                                      :preview-src-list="[scope.row.bpmnPicture]"
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
                        </div>
                        <div v-if="scope.row.workflowType == '会议室申请'" id="meetingRoom">
                            <div class="container">
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
                                                    <td>{{ scope.row.applicantName }}</td>
                                                    <th>部门</th>
                                                    <td>{{ scope.row.applicantDeptName }}</td>
                                                    <th>职务</th>
                                                    <td>{{ scope.row.applicantJobName }}</td>
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
                                                    <td colspan="5" class="left">{{scope.row.meetingRoomName}}【上限{{scope.row.meetingRoomMax}}人】</td>
                                                </tr>
                                                <tr>
                                                    <th>申请事由</th>
                                                    <td colspan="5" class="left">
                                                        <div class="reason">{{ scope.row.reason }}</div>
                                                    </td>
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
                                            <el-image :src="scope.row.bpmnPicture"
                                                      :preview-src-list="[scope.row.bpmnPicture]"
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
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="workflowType" header-align="center" align="center" label="类别" min-width="160"
                             show-overflow-tooltip/>
            <el-table-column prop="applicantName" header-align="center" align="center" label="申请人" min-width="200"
                             show-overflow-tooltip/>
            <el-table-column prop="applicantDeptName" header-align="center" align="center" label="所属部门"
                             min-width="200"
                             show-overflow-tooltip/>
            <el-table-column prop="createTime" header-align="center" align="center" label="创建日期" min-width="170"/>
            <el-table-column prop="taskName" header-align="center" align="center" label="任务名称" min-width="200"/>
            <el-table-column header-align="center" align="center" label="流程状态" min-width="170">
                <template #default="scope">
                    <span v-if="formData.status == '待审批'">执行中</span>
                    <span v-else-if="formData.status == '已审批'">已审批</span>
                    <span v-else>已结束</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" label="审批结果" min-width="170">
                <template #default="scope">
                    <span v-if="scope.row.finalApprovalResult == true">【 已通过 】</span>
                    <span v-else-if="scope.row.finalApprovalResult == false">【 已否决 】</span>
                    <span v-else>【 审批中 】</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center"
                             width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" @click="showDialog(scope.row.taskId)"
                               v-if="formData.status=='待审批'"
                               :disabled="!isAuth(['ADMINISTRATIVE_APPROVAL:APPROVAL'])" link>
                        审批
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="pageSizeChange" @current-change="pageIndexChange"
                       :current-page="tableData.pageIndex" :page-sizes="[10, 20, 50]" :page-size="tableData.pageSize"
                       :total="tableData.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
        <el-dialog title="执行审批" v-model="dialog.visible" width="450" :close-on-click-modal="false"
                   v-if="proxy.isAuth(['ADMINISTRATIVE_APPROVAL:APPROVAL'])">
            <div class="tip">
                <el-alert type="warning" :closable="false" show-icon
                          description="你执行审批之后将无法撤回该审批，所以审批任务的时候必须谨慎小心，看清审批内容之后再执行。"
                />
            </div>
            <el-form ref="dialogForm" :model="dialog.formData">
                <el-form-item>
                    <el-input type="textarea" v-model="dialog.formData.approvalComment"
                              placeholder="审批附言（非必填）" maxlength="400" :rows="6"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="danger" @click="approvalSubmit(false)">否决</el-button>
                    <el-button type="primary" @click="approvalSubmit(true)">同意</el-button>
                </span>
            </template>
        </el-dialog>

    </div>
</template>


<script setup lang="ts">
import {reactive, getCurrentInstance, ref, nextTick} from 'vue';
import {dayjs} from "element-plus";
import {Search, Plus, Delete, Tickets, Memo, Picture} from "@element-plus/icons-vue";
import Cropper from "cropperjs";
import {numberToChineseUppercaseCurrency} from "pixiu-number-toolkit";

const {proxy} = getCurrentInstance();


/** 响应对象区域 *********************************************************/

const formData = reactive({
    workflowType: null,
    workflowTypeList: [
        {
            label: "员工请假",
            value: "员工请假"
        },
        {
            label: "报销",
            children: [
                {
                    label: "差旅费报销",
                    value: "差旅费报销"
                },
                {
                    label: "市内车费报销",
                    value: "市内车费报销"
                }
            ]
        }
    ],
    deptId: null,
    deptList: [],
    dateRange: [],
    applicantName: null,
    status: "待审批"
});

const rule = reactive({
    name: [
        {pattern: '^[\u4e00-\u9fa5]{1,20}$', message: '申请人姓名格式错误', trigger: 'blur'}
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
        return row.taskId;
    }
});

const dialog = reactive({
    visible: false,
    formData: {
        taskId: null,
        approvalComment: null
    }
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

function loadTableData() {
    tableData.loading = true;
    tableData.expands = [];
    const data = {
        workflowType: formData.workflowType,
        deptId: formData.deptId,
        startDate: formData.dateRange ? formData.dateRange[0] : null,
        endDate: formData.dateRange ? formData.dateRange[1] : null,
        applicantName: formData.applicantName,
        status: formData.status,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/administrative/approval/search-by-page", "POST", data, false, resp => {
        let result = resp.result;
        if (result.status === "SUCCESS") {
            let page = result.page;

            let list = page.list;
            list.forEach(row => {
                if (row.workflowType == "差旅费报销") {
                    row.activeName = "reimburseTab"

                    let travelList = row.travelList
                    for (let i = 0; i < 6; i++) {
                        if (i + 1 > travelList.length) {
                            travelList.push({})
                        }
                        else {
                            travelList[i].fare = `￥${travelList[i].fare}元`
                        }
                    }

                    let subsidyList = row.subsidyList
                    for (let i = 0; i < 6; i++) {
                        if (i + 1 > subsidyList.length) {
                            subsidyList.push({})
                        }
                        else {
                            subsidyList[i].subsidy = `￥${subsidyList[i].subsidy}元`
                        }
                    }

                    let localTravelList = row.localTravelList
                    for (let one of localTravelList) {
                        one.amount = `￥${one.amount}元`
                    }

                    let length = localTravelList.length
                    if (length > 0 && length < 10) {
                        for (let i = 0; i < (10 - length); i++) {
                            localTravelList.push({})
                        }
                    }

                    if (Number(row.reimburseAmount) > 0) {
                        row.replenishmentAmount = `￥${row.reimburseAmount}元`;
                        row.refundAmount = `￥0.00元`
                    }
                    else {
                        row.replenishmentAmount = `￥0.00元`
                        row.refundAmount = `￥${Math.abs(row.reimburseAmount)}元`;
                    }
                }
                else if(row.workflowType == "会议室申请"){
                    row.startTime=dayjs(row.startTime).format("HH:mm");
                    row.endTime=dayjs(row.endTime).format("HH:mm");
                }
            });


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

function expand(row, expandedRows) {
    if (expandedRows.length > 0) {
        tableData.expands = [];
        if (row.workflowType == "员工请假") {
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
                    row.approvalList = result.approvalList;
                }
            });
        }
        else if (row.workflowType == "差旅费报销") {
            row.activeName = "reimburseTab"

            let data = {
                instanceId: row.instanceId
            };
            proxy.$http('/mis/travel/expense/search-approval-info', 'POST', data, false, function (resp) {
                let result = resp.result;
                if (result.status === "SUCCESS") {
                    row.bpmnPicture = result.bpmnPicture
                    let approvalList = result.approvalList;
                    approvalList.forEach(one => {
                        one.completeTime = dayjs(one.completeTime).format("YYYY/MM/DD HH:mm")
                        one.approvalResult = (one.approvalResult ? "通过" : "否决")
                    })
                    row.approvalList = result.approvalList;
                }
            });

        }
        else if (row.workflowType == "员工请款") {
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
                    row.approvalList = result.approvalList;
                }
            });
        }
        else if(row.workflowType == "会议室申请"){
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
                    row.approvalList = result.approvalList;
                }
            });
        }

        tableData.expands.push(row.taskId);
    }

    else {
        tableData.expands = [];
    }
}

function searchByCondition() {
    proxy.$refs.form.validate((valid) => {
        if (valid) {
            tableData.pageIndex = 1;
            loadTableData();
        }
    })
}

function showDialog(taskId) {
    dialog.formData.taskId = taskId;
    dialog.formData.approvalComment = null;
    dialog.visible = true;
}

function approvalSubmit(bool) {
    let data = {
        taskId: dialog.formData.taskId,
        approvalComment: dialog.formData.approvalComment,
        approvalResult: bool
    }

    proxy.$http("/mis/administrative/approval/execute-approval-task", "POST", data, true, function (resp) {
        let result = resp.result;
        if (result.status === "SUCCESS") {
            dialog.visible = false;
            proxy.$message({
                type: "success",
                message: "审批成功",
                duration: 1200,
                onClose: () => {
                    loadTableData();
                }
            });
        }
    })
}

</script>
<style scoped lang="scss">
@use "approval";
</style>