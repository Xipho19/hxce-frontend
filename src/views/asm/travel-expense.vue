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
                                <div id="travelExpenseContainer" class="travel-expense-container">
                                    <div class="reimburse-header">
                                        <div class="left">
                                            <div class="desc">详情信息</div>
                                            <img :src="scope.row.qrCode" width="60" height="60" alt="二维码"/>
                                            <div class="desc">扫码查看</div>
                                        </div>
                                        <h3 class="reimburse-title"
                                            @dblclick="downloadPdf('travelExpenseContainer','差旅费报销单',scope.row.status,scope.row.isOwner)">
                                            差旅费用报销单
                                        </h3>
                                        <div class="right">
                                            <p><b>部门：</b>{{ scope.row.deptName }}</p>
                                            <p><b>日期：</b>{{ dayjs(scope.row.createTime).format('YYYY/MM/DD') }}
                                            </p>
                                        </div>
                                    </div>
                                    <table class="travel-expense-table">
                                        <tbody>
                                        <tr>
                                            <th colspan="2">出差人</th>
                                            <td colspan="4" class="left">{{ scope.row.name }}</td>
                                            <th colspan="2">出差事由</th>
                                            <td colspan="6" class="left" id="reason">{{ scope.row.reason }}</td>
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
                                            <td>{{ scope.row.detail.travelList[0].startMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[0].startDate }}</td>
                                            <td>{{ scope.row.detail.travelList[0].startHour }}</td>
                                            <td>{{ scope.row.detail.travelList[0].startPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[0].endMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[0].endDate }}</td>
                                            <td>{{ scope.row.detail.travelList[0].endHour }}</td>
                                            <td>{{ scope.row.detail.travelList[0].endPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[0].vehicle }}</td>
                                            <td>{{ scope.row.detail.travelList[0].fare }}</td>
                                            <td>{{ scope.row.detail.subsidyList[0].days }}</td>
                                            <td>{{ scope.row.detail.subsidyList[0].subsidy }}</td>
                                            <th>住宿费</th>
                                            <td>￥{{ scope.row.accommodationExpense }}元</td>
                                        </tr>
                                        <tr>
                                            <td>{{ scope.row.detail.travelList[1].startMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[1].startDate }}</td>
                                            <td>{{ scope.row.detail.travelList[1].startHour }}</td>
                                            <td>{{ scope.row.detail.travelList[1].startPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[1].endMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[1].endDate }}</td>
                                            <td>{{ scope.row.detail.travelList[1].endHour }}</td>
                                            <td>{{ scope.row.detail.travelList[1].endPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[1].vehicle }}</td>
                                            <td>{{ scope.row.detail.travelList[1].fare }}</td>
                                            <td>{{ scope.row.detail.subsidyList[1].days }}</td>
                                            <td>{{ scope.row.detail.subsidyList[1].subsidy }}</td>
                                            <th>市内车费</th>
                                            <td>￥{{ scope.row.localTravelExpense }}元</td>
                                        </tr>
                                        <tr>
                                            <td>{{ scope.row.detail.travelList[2].startMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[2].startDate }}</td>
                                            <td>{{ scope.row.detail.travelList[2].startHour }}</td>
                                            <td>{{ scope.row.detail.travelList[2].startPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[2].endMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[2].endDate }}</td>
                                            <td>{{ scope.row.detail.travelList[2].endHour }}</td>
                                            <td>{{ scope.row.detail.travelList[2].endPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[2].vehicle }}</td>
                                            <td>{{ scope.row.detail.travelList[2].fare }}</td>
                                            <td>{{ scope.row.detail.subsidyList[2].days }}</td>
                                            <td>{{ scope.row.detail.subsidyList[2].subsidy }}</td>
                                            <th>其他</th>
                                            <td>￥{{ scope.row.otherExpense }}元</td>
                                        </tr>
                                        <tr>
                                            <td>{{ scope.row.detail.travelList[3].startMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[3].startDate }}</td>
                                            <td>{{ scope.row.detail.travelList[3].startHour }}</td>
                                            <td>{{ scope.row.detail.travelList[3].startPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[3].endMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[3].endDate }}</td>
                                            <td>{{ scope.row.detail.travelList[3].endHour }}</td>
                                            <td>{{ scope.row.detail.travelList[3].endPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[3].vehicle }}</td>
                                            <td>{{ scope.row.detail.travelList[3].fare }}</td>
                                            <td>{{ scope.row.detail.subsidyList[3].days }}</td>
                                            <td>{{ scope.row.detail.subsidyList[3].subsidy }}</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>{{ scope.row.detail.travelList[4].startMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[4].startDate }}</td>
                                            <td>{{ scope.row.detail.travelList[4].startHour }}</td>
                                            <td>{{ scope.row.detail.travelList[4].startPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[4].endMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[4].endDate }}</td>
                                            <td>{{ scope.row.detail.travelList[4].endHour }}</td>
                                            <td>{{ scope.row.detail.travelList[4].endPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[4].vehicle }}</td>
                                            <td>{{ scope.row.detail.travelList[4].fare }}</td>
                                            <td>{{ scope.row.detail.subsidyList[4].days }}</td>
                                            <td>{{ scope.row.detail.subsidyList[4].subsidy }}</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>{{ scope.row.detail.travelList[5].startMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[5].startDate }}</td>
                                            <td>{{ scope.row.detail.travelList[5].startHour }}</td>
                                            <td>{{ scope.row.detail.travelList[5].startPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[5].endMonth }}</td>
                                            <td>{{ scope.row.detail.travelList[5].endDate }}</td>
                                            <td>{{ scope.row.detail.travelList[5].endHour }}</td>
                                            <td>{{ scope.row.detail.travelList[5].endPlace }}</td>
                                            <td>{{ scope.row.detail.travelList[5].vehicle }}</td>
                                            <td>{{ scope.row.detail.travelList[5].fare }}</td>
                                            <td>{{ scope.row.detail.subsidyList[5].days }}</td>
                                            <td>{{ scope.row.detail.subsidyList[5].subsidy }}</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <th colspan="9"></th>
                                            <th id="fareSum">￥{{ scope.row.travelCostAmount }}元</th>
                                            <th></th>
                                            <th id="subsidySum">￥{{ scope.row.travelSubsidyAmount }}元</th>
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
                                                大写：{{ numberToChineseUppercaseCurrency(scope.row.totalAmount) }}
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
                                    <ul class="reimburse-footer"
                                        v-if="scope.row.status == '申请中'&&scope.row.isOwner==true">
                                        <li>领款人：<span></span></li>
                                        <li>部门经理：<span></span></li>
                                        <li>财务审核：<span></span></li>
                                        <li>总经理：<span></span></li>
                                    </ul>
                                </div>
                                <div id="localTravelExpenseContainer" class="local-travel-expense-container"
                                     v-if="scope.row.detail.localTravelList.length > 0">
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
                                        <tr v-for="one in scope.row.detail.localTravelList" :key="i">
                                            <td>{{ one.date }}</td>
                                            <td>{{ one.time }}</td>
                                            <td>{{ one.route }}</td>
                                            <td>{{ one.reason }}</td>
                                            <td>{{ one.amount }}</td>
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
            <el-table-column prop="name" header-align="center" align="center" label="出差人" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="deptName" header-align="center" align="center" label="所属部门" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="totalAmount" header-align="center" align="center" label="总金额" min-width="150"/>
            <el-table-column prop="reason" header-align="center" align="center" label="出差事由" min-width="220"/>
            <el-table-column prop="status" header-align="center" align="center" label="执行状态" min-width="150"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="230" label="操作">
                <template #default="scope">
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['TRAVEL_EXPENSE:ARCHIVE'])||scope.row.status!='已批准'"
                               @click="showArchiveDialog(scope.row.id,scope.row.instanceId)">
                        归档
                    </el-button>
                    <el-button type="primary" link
                               :disabled="!proxy.isAuth(['TRAVEL_EXPENSE:LOAD'])||scope.row.status!='已归档'"
                               @click="showArchiveImageDrawer(scope.row.id,scope.row.images)">
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
        <el-dialog title="填写差旅费报销申请" v-model="reimburseDialog.visible" width="1050" top="70px"
                   :close-on-click-modal="false">
            <el-tabs v-model="reimburseDialog.tabs.activeName">
                <el-tab-pane name="travelExpenseTab">
                    <template #label>
                        <div class="custom-tabs-label">
                            <el-icon size="15" v-if="reimburseDialog.tabs.validateResult[0]">
                                <SuccessFilled/>
                            </el-icon>
                            <el-icon size="15" v-if="!reimburseDialog.tabs.validateResult[0]">
                                <WarningFilled/>
                            </el-icon>
                            <span> 差旅费</span>
                        </div>
                    </template>

                    <div class="dialog-reimburse-title">
                        <h3>差旅费报销单</h3>
                    </div>
                    <table class="dialog-travel-expense-table">
                        <tbody>
                        <tr>
                            <th colspan="2">出差人</th>
                            <td colspan="4" class="left">{{ name }}</td>
                            <th colspan="2">出差事由</th>
                            <td colspan="6" class="left" id="dialogReason">
                                <input v-model="reimburseDialog.formData.reason" class="input" maxlength="35"/>
                            </td>
                        </tr>
                        <tr>
                            <th colspan="4">出发</th>
                            <th colspan="4">到达</th>
                            <th colspan="1" rowspan="2">交通工具</th>
                            <th colspan="1" rowspan="2">交通费</th>
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
                            <th>天数</th>
                            <th>金额</th>
                            <th>项目</th>
                            <th>金额</th>
                        </tr>
                        <tr>
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
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <th>住宿费</th>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                        </tr>
                        <tr>
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
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <th>市内车费</th>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                        </tr>
                        <tr>
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
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <th>其他</th>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                        </tr>
                        <tr>
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
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
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
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
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
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td>
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th colspan="9"></th>
                            <th id="dialogFareSum"></th>
                            <th></th>
                            <th id="dialogSubsidySum"></th>
                            <th></th>
                            <th id="dialogOtherSum"></th>
                        </tr>

                        <tr>
                            <th colspan="2" rowspan="2">报销总额</th>
                            <th colspan="6" class="left" id="dialogReimburseTotalAmount"></th>
                            <th colspan="1" rowspan="2">预借旅费</th>
                            <td colspan="2" rowspan="2" id="dialogLoanAmount">
                                <div contenteditable="true" @keydown="keyDownListener"></div>
                            </td>
                            <th colspan="1">补领金额</th>
                            <th colspan="2" class="left" id="dialogReplenishmentAmount"></th>
                        </tr>
                        <tr>
                            <th colspan="6" class="left" id="dialogReimburseChineseTotalAmount"></th>
                            <th colspan="1">退还金额</th>
                            <th colspan="2" class="left" id="dialogRefundAmount"></th>
                        </tr>
                        </tbody>
                    </table>
                </el-tab-pane>
                <el-tab-pane name="localTravelExpenseTab">
                    <template #label>
                        <div class="custom-tabs-label">
                            <el-icon size="15" v-if="reimburseDialog.tabs.validateResult[1]">
                                <SuccessFilled/>
                            </el-icon>
                            <el-icon size="15" v-if="!reimburseDialog.tabs.validateResult[1]">
                                <WarningFilled/>
                            </el-icon>
                            <span> 市内车费</span>
                        </div>
                    </template>
                    <div class="dialog-reimburse-title">
                        <h3>市内交通报销单</h3>
                    </div>
                    <el-scrollbar ref="scrollbar" height="467px">
                        <table class="dialog-local-travel-expense-table">
                            <tbody>
                            <tr>
                                <th>日期</th>
                                <th>时间</th>
                                <th>乘车路线</th>
                                <th>事由</th>
                                <th>金额</th>
                            </tr>
                            <tr v-for="i in (0,50)" :key="i">
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
                    </el-scrollbar>
                </el-tab-pane>
            </el-tabs>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="reimburseDialog.visible = false">取消</el-button>
                    <el-button type="primary" @click="validateCurrentTab()">校验本页报销单</el-button>
                    <el-button type="primary" @click="saveSubmit()">提交报销单</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog title="执行归档" v-model="archiveDialog.visible" width="518" :close-on-click-modal="false"
                   v-if="proxy.isAuth(['TRAVEL_EXPENSE:ARCHIVE'])" @closed="archiveDialogClosed">
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
                   v-if="proxy.isAuth(['TRAVEL_EXPENSE:ARCHIVE','TRAVEL_EXPENSE:LOAD'])"
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
                               :disabled="!proxy.isAuth(['TRAVEL_EXPENSE:ARCHIVE'])">更新归档图片
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
const name = ref(localStorage.getItem('name'))

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
    tabs: {
        activeName: "travelExpenseTab",
        validateResult: [false, false]
    },
    formData: {
        reason: null,
        travelList: [], //出差行程列表
        subsidyList: [], //出差补贴列表
        localTravelList: [], //市内交通费列表
        accommodationExpense: null, //住宿费
        localTravelExpense: null, //市内交通费
        otherExpense: null, //其他费用
        totalAmount: null, //报销总额
        loanAmount: null, //借款总额
        reimburseAmount: null, //实际报销总额
        travelCostAmount: null, //交通费合计
        travelSubsidyAmount: null,//补贴合计
        otherAmount: null //其他费用合计
    }
});

const archiveDialog = reactive({
    visible: false,
    url: proxy.$baseUrl + "/mis/travel/expense/archive",
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
    proxy.$http("/mis/travel/expense/search-by-page", "POST", data, true, resp => {
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
                let travelList = one.detail.travelList
                for (let i = 0; i < 6; i++) {
                    if (i + 1 > travelList.length) {
                        travelList.push({})
                    }
                    else {
                        travelList[i].fare = `￥${travelList[i].fare}元`
                    }
                }

                let subsidyList = one.detail.subsidyList
                for (let i = 0; i < 6; i++) {
                    if (i + 1 > subsidyList.length) {
                        subsidyList.push({})
                    }
                    else {
                        subsidyList[i].subsidy = `￥${subsidyList[i].subsidy}元`
                    }
                }

                let localTravelList = one.detail.localTravelList
                for (let item of localTravelList) {
                    item.amount = `￥${item.amount}元`
                }

                let length = localTravelList.length
                if (length > 0 && length < 10) {
                    for (let i = 0; i < (10 - length); i++) {
                        localTravelList.push({})
                    }
                }

                if (Number(one.reimburseAmount) > 0) {
                    one.replenishmentAmount = `￥${one.reimburseAmount}元`;
                    one.refundAmount = `￥0.00元`
                }
                else {
                    one.replenishmentAmount = `￥0.00元`
                    one.refundAmount = `￥${Number(Math.abs(one.reimburseAmount)).toFixed(2)}元`;
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
        proxy.$http('/mis/travel/expense/search-approval-info', 'POST', data, false, function (resp) {
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
    reimburseDialog.tabs.validateResult[0] = false;
    reimburseDialog.tabs.validateResult[1] = false;
    let keyCode = e.keyCode;
    if (keyCode == 13 || keyCode == 32) {
        e.preventDefault();
    }
}

function showReimburseDialog() {
    reimburseDialog.tabs.activeName = "travelExpenseTab";
    reimburseDialog.formData.reason = null;
    reimburseDialog.formData.travelList = [];
    reimburseDialog.formData.subsidyList = [];
    reimburseDialog.formData.localTravelList = [];
    reimburseDialog.formData.accommodationExpense = null;
    reimburseDialog.formData.localTravelExpense = null;
    reimburseDialog.formData.otherExpense = null;
    reimburseDialog.formData.totalAmount = null;
    reimburseDialog.formData.loanAmount = null;
    reimburseDialog.formData.reimburseAmount = null;
    reimburseDialog.formData.travelCostAmount = null;
    reimburseDialog.formData.travelSubsidyAmount = null;
    reimburseDialog.formData.otherAmount = null;

    //单元格背景色恢复成正确的样式
    let correctStyle = {"background-color": "#fff"}
    let reasonCell = $("#dialogReason");
    let input = reasonCell.find("input");
    reasonCell.css(correctStyle)
    input.css(correctStyle)
    $(".dialog-travel-expense-table tr:gt(0)>td").css(correctStyle)
    $(".dialog-local-travel-expense-table tr:gt(0)>td").css(correctStyle)

    //弹窗中所有的td单元格内容都要清空
    $(".dialog-travel-expense-table tr:gt(0)>td>div").text("")
    $(".dialog-local-travel-expense-table tr:gt(0)>td>div").text("")
    $("#dialogFareSum").text("")
    $("#dialogSubsidySum").text("")
    $("#dialogOtherSum").text("")
    $("#dialogReimburseTotalAmount").text("")
    $("#dialogReimburseChineseTotalAmount").text("")
    $("#dialogReplenishmentAmount").text("")
    $("#dialogRefundAmount").text("")
    $("#dialogLtChineseTotalAmount").text("")
    $("#dialogLtChineseTotalAmount").text("")

    reimburseDialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.scrollbar.setScrollTop(0);
    })
}

function processingData() {
    let errorStyle = {"background-color": "#f89898"}
    let correctStyle = {"background-color": "#fff"}

    //校验差旅费报销单
    if (reimburseDialog.tabs.activeName == "travelExpenseTab") {
        reimburseDialog.formData.travelList = [];
        reimburseDialog.formData.subsidyList = [];
        let rowList = $(".dialog-travel-expense-table tr:gt(2)");
        let flag = [];
        let fareSum = 0;
        let subsidySum = 0;
        let otherSum = 0

        let reasonCell = $("#dialogReason");
        let input = reasonCell.find("input");
        if (isBlank(reimburseDialog.formData.reason)) {
            reasonCell.css(errorStyle)
            input.css(errorStyle)
            proxy.$message({
                type: "error",
                message: "请填写出差事由",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[0] = false;
            return;
        }
        else {
            reasonCell.css(correctStyle)
            input.css(correctStyle)
        }

        let fareSumCell = $("#dialogFareSum")
        fareSumCell.text("");

        let subsidySumCell = $("#dialogSubsidySum");
        subsidySumCell.text("");


        let otherSumCell = $("#dialogOtherSum");
        otherSumCell.text("");

        let reimburseTotalAmountCell = $("#dialogReimburseTotalAmount");
        reimburseTotalAmountCell.text("");

        let replenishmentAmountCell = $("#dialogReplenishmentAmount");
        replenishmentAmountCell.text("");

        let reimburseChineseTotalAmountCell = $("#dialogReimburseChineseTotalAmount")
        reimburseChineseTotalAmountCell.text("");

        let refundAmountCell = $("#dialogRefundAmount");
        refundAmountCell.text("");

        //统计出差行程
        for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
            let cellList = $(rowList[rowIndex]).find("td")

            let startMonthCell = cellList.eq(0);
            let startDateCell = cellList.eq(1);
            let startHourCell = cellList.eq(2);
            let startPlaceCell = cellList.eq(3);
            let endMonthCell = cellList.eq(4);
            let endDateCell = cellList.eq(5);
            let endHourCell = cellList.eq(6);
            let endPlaceCell = cellList.eq(7);
            let vehicleCell = cellList.eq(8);
            let fareCell = cellList.eq(9);

            let startMonth = startMonthCell.text();
            let startDate = startDateCell.text();
            let startHour = startHourCell.text();
            let startPlace = startPlaceCell.text();
            let endMonth = endMonthCell.text();
            let endDate = endDateCell.text();
            let endHour = endHourCell.text();
            let endPlace = endPlaceCell.text();
            let vehicle = vehicleCell.text();
            let fare = fareCell.text();

            let bool = [];
            let year = new Date().getFullYear()
            if (!isBlank(startMonth) || !isBlank(startDate) || !isBlank(startHour) || !isBlank(startPlace)
                || !isBlank(endMonth) || !isBlank(endDate) || !isBlank(endHour) || !isBlank(endPlace)
                || !isBlank(vehicle) || !isBlank(fare)) {

                if (!isDate(year + "-" + startMonth + "-" + startDate)) {
                    startMonthCell.css(errorStyle)
                    startDateCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    startMonthCell.css(correctStyle)
                    startDateCell.css(correctStyle)
                    bool.push(true);
                }
                if (!isHour(startHour)) {
                    startHourCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    startHourCell.css(correctStyle)
                    bool.push(true);
                }

                if (!isCity(startPlace)) {
                    startPlaceCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    startPlaceCell.css(correctStyle)
                    bool.push(true);
                }

                if (!isDate(year + "-" + endMonth + "-" + endDate)) {
                    endMonthCell.css(errorStyle)
                    endDateCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    endMonthCell.css(correctStyle)
                    endDateCell.css(correctStyle)
                    bool.push(true);
                }

                if (!isHour(endHour)) {
                    endHourCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    endHourCell.css(correctStyle)
                    bool.push(true);
                }

                if (dayjs(`${year}-${endMonth}-${endDate} ${endHour}:00:00`).isBefore(dayjs(`${year}-${startMonth}-${startDate} ${startHour}:00:00`))) {
                    startMonthCell.css(errorStyle)
                    startDateCell.css(errorStyle)
                    startHourCell.css(errorStyle)
                    endMonthCell.css(errorStyle)
                    endDateCell.css(errorStyle)
                    endHourCell.css(errorStyle)
                    bool.push(false);
                }

                if (!isCity(endPlace)) {
                    endPlaceCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    endPlaceCell.css(correctStyle)
                    bool.push(true);
                }

                if (isBlank(vehicle) || vehicle.length > 5) {
                    vehicleCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    vehicleCell.css(correctStyle)
                    bool.push(true);
                }

                if (!isAmount(fare)) {
                    fareCell.css(errorStyle)
                    bool.push(false);
                }
                else {
                    fareCell.css(correctStyle)
                    bool.push(true);
                }
            }
            else {
                startMonthCell.css(correctStyle)
                startDateCell.css(correctStyle)
                startHourCell.css(correctStyle)
                startPlaceCell.css(correctStyle)
                endMonthCell.css(correctStyle)
                endDateCell.css(correctStyle)
                endHourCell.css(correctStyle)
                endPlaceCell.css(correctStyle)
                vehicleCell.css(correctStyle)
                fareCell.css(correctStyle)
            }

            if (bool.length > 0 && bool.every(one => (one == true))) {
                reimburseDialog.formData.travelList.push(
                    {
                        year: year,
                        startMonth: startMonth,
                        startDate: startDate,
                        startHour: startHour,
                        startPlace: startPlace,
                        endMonth: endMonth,
                        endDate: endDate,
                        endHour: endHour,
                        endPlace: endPlace,
                        vehicle: vehicle,
                        fare: fare
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
                message: "请填写出差行程",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[0] = false;
            return
        }
        else if (flag.every(one => (one == true))) {
            for (let one of reimburseDialog.formData.travelList) {
                fareSum = add(fareSum, Number(one.fare));
            }
            //把金额转为两位小数
            fareSum = Number(fareSum).toFixed(2)
            fareSumCell.text(fareSum);
            reimburseDialog.formData.travelCostAmount = fareSum;
        }
        else {
            proxy.$message({
                type: "error",
                message: "行程信息存在错误",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[0] = false;
            return
        }

        //统计出差补贴
        flag = []
        for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
            let bool = [];
            let cellList = $(rowList[rowIndex]).find("td")

            let daysCell = cellList.eq(10);
            let subsidyCell = cellList.eq(11);

            let days = daysCell.text();
            let subsidy = subsidyCell.text();

            if (!isBlank(days) || !isBlank(subsidy)) {
                if (!isDays(days) || Number(days) > 365) {
                    daysCell.css(errorStyle);
                    bool.push(false);
                }
                else {
                    daysCell.css(correctStyle);
                    bool.push(true);
                }

                if (!isAmount(subsidy)) {
                    subsidyCell.css(errorStyle);
                    bool.push(false);
                }
                else {
                    subsidyCell.css(correctStyle);
                    bool.push(true);
                }
            }
            else {
                daysCell.css(correctStyle)
                subsidyCell.css(correctStyle)
            }

            if (bool.length == 0) {

            }
            else if (bool.length > 0 && bool.every(one => (one == true))) {
                reimburseDialog.formData.subsidyList.push({
                    days: days,
                    subsidy: subsidy
                })
                flag.push(true);
            }
            else {
                flag.push(false);
            }
        }

        if (flag.length == 0) {
            subsidySumCell.text("￥0.00");
        }
        else if (flag.every(one => (one == true))) {
            for (let one of reimburseDialog.formData.subsidyList) {
                subsidySum = add(subsidySum, Number(one.subsidy));
            }
            //把金额转为两位小数
            subsidySum = Number(subsidySum).toFixed(2)
            subsidySumCell.text(subsidySum);
            reimburseDialog.formData.travelSubsidyAmount = subsidySum;
        }
        else {
            proxy.$message({
                type: "error",
                message: "出差补贴存在错误",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[0] = false;
            return;
        }

        //统计其他费用
        flag = []
        for (let rowIndex = 0; rowIndex <= 2; rowIndex++) {
            let bool = true;
            let cellList = $(rowList[rowIndex]).find("td")
            //因为表格行中有<th>列，所以本行最后一个td的索引为12
            let amountCell = cellList.eq(12);
            let amount = amountCell.text();

            if (!isBlank(amount)) {
                if (!isAmount(amount)) {
                    amountCell.css(errorStyle);
                    bool = false;
                }
                else {
                    amountCell.css(correctStyle);
                    bool = true;
                }
            }
            else {
                amountCell.css(correctStyle)
            }

            if (bool) {
                switch (rowIndex) {
                    case 0:
                        reimburseDialog.formData.accommodationExpense = amount;
                        otherSum = add(otherSum, Number(amount));
                        break;
                    case 1:
                        reimburseDialog.formData.localTravelExpense = amount;
                        otherSum = add(otherSum, Number(amount));
                        break;
                    case 2:
                        reimburseDialog.formData.otherExpense = amount;
                        otherSum = add(otherSum, Number(amount));
                        break;
                }
                flag.push(true);
            }
            else {
                flag.push(false);
            }
        }

        if (flag.length == 0) {
            otherSumCell.text("￥0.00");
        }
        else if (flag.every(one => (one == true))) {
            otherSum = Number(otherSum).toFixed(2)
            otherSumCell.text(otherSum);
            reimburseDialog.formData.otherAmount = otherSum;
        }
        else {
            proxy.$message({
                type: "error",
                message: "其他费用存在错误",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[0] = false;
            return;
        }

        let loanAmountRef = $("#dialogLoanAmount")
        let loanAmount = loanAmountRef.text();
        if (isBlank(loanAmount)) {
            loanAmountRef.css(errorStyle)
            proxy.$message({
                type: "error",
                message: "请填写预借旅费",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[0] = false;
            return;
        }
        else if (!isAmount(loanAmount)) {
            loanAmountRef.css(errorStyle)
            proxy.$message({
                type: "error",
                message: "预借旅费不正确",
                duration: 1200
            })
            replenishmentAmountCell.text("");
            refundAmountCell.text("")
            reimburseDialog.tabs.validateResult[0] = false;
            return;
        }
        else {
            loanAmountRef.css(correctStyle)
            reimburseDialog.formData.loanAmount = loanAmount;
        }
        //计算报销总额
        let totalAmount = add(fareSum, subsidySum, otherSum);
        totalAmount = Number(totalAmount).toFixed(2)
        reimburseDialog.formData.totalAmount = totalAmount;
        //计算实际报销金额
        let reimburseAmount = subtract(totalAmount, loanAmount);
        reimburseAmount = Number(reimburseAmount).toFixed(2)
        reimburseDialog.formData.reimburseAmount = reimburseAmount;

        if (reimburseAmount == 0) {
            replenishmentAmountCell.text("￥0.00元")
            refundAmountCell.text("￥0.00元")
        }
        else if (reimburseAmount > 0) {
            replenishmentAmountCell.text(`￥${reimburseAmount}元`);
            refundAmountCell.text("￥0.00元");
        }
        else {
            replenishmentAmountCell.text("￥0.00元");
            refundAmountCell.text(`￥${Math.abs(reimburseAmount)}元`);
        }

        reimburseTotalAmountCell.text(`人民币￥：${totalAmount}元`);

        let chineseTotalAmount = numberToChineseUppercaseCurrency(totalAmount);
        reimburseChineseTotalAmountCell.text(`大写：${chineseTotalAmount}`);

        proxy.$message({
            type: "success",
            message: "本页报销单验证成功",
            duration: 1200
        })

        reimburseDialog.tabs.validateResult[0] = true;
    }
    //校验市内交通报销单
    else {
        //提示用户先校验差旅费报销单
        if (reimburseDialog.tabs.validateResult[0] == false) {
            proxy.$message({
                type: "error",
                message: "请先校验差旅费报销单",
                duration: 1200
            })
            return;
        }
        let localTravelExpense = reimburseDialog.formData.localTravelExpense;

        reimburseDialog.formData.localTravelList = [];
        let rowList = $(".dialog-local-travel-expense-table tr:gt(0)");
        let flag = [];
        let totalAmount = 0
        let localTravelTotalAmountCell = $("#dialogLtTotalAmount")
        localTravelTotalAmountCell.text("");
        let localTravelChineseTotalAmountCell = $("#dialogLtChineseTotalAmount");
        localTravelChineseTotalAmountCell.text("");
        for (let rowIndex = 0; rowIndex < 50; rowIndex++) {
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

        if (!isBlank(localTravelExpense) && Number(localTravelExpense) > 0 && flag.length == 0) {
            proxy.$message({
                type: "error",
                message: "请填写市内交通行程",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[1] = false;
            return
        }
        else if (flag.every(one => (one == true))) {
            for (let one of reimburseDialog.formData.localTravelList) {
                totalAmount = add(totalAmount, Number(one.amount));
            }

            if (Number(totalAmount) != Number(localTravelExpense)) {
                proxy.$message({
                    type: "error",
                    message: "两张报销单的市内交通费不一致",
                    duration: 1200
                })
                reimburseDialog.tabs.validateResult[1] = false;
                return
            }
            totalAmount = Number(totalAmount).toFixed(2)
            localTravelTotalAmountCell.text(`人民币￥：${totalAmount}元`)
            localTravelChineseTotalAmountCell.text(`人民币￥：${numberToChineseUppercaseCurrency(totalAmount)}`)
            proxy.$message({
                type: "success",
                message: "本页报销单验证成功",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[1] = true;

        }
        else {
            proxy.$message({
                type: "error",
                message: "行程信息存在错误",
                duration: 1200
            })
            reimburseDialog.tabs.validateResult[1] = false;
            return
        }


    }
}


function validateCurrentTab() {
    processingData()
}

function saveSubmit() {
    let flag;
    if (reimburseDialog.tabs.validateResult[0] && reimburseDialog.tabs.validateResult[1]) {
        flag = true
    }
    else {
        flag = false
        proxy.$message({
            type: "error",
            message: "请先验证所有报销单",
            duration: 1200
        })
    }

    if (flag) {
        let data = {
            reason: reimburseDialog.formData.reason,

            accommodationExpense: coverBlankToZero(reimburseDialog.formData.accommodationExpense),
            localTravelExpense: coverBlankToZero(reimburseDialog.formData.localTravelExpense),
            otherExpense: coverBlankToZero(reimburseDialog.formData.otherExpense),

            totalAmount: coverBlankToZero(reimburseDialog.formData.totalAmount),
            loanAmount: coverBlankToZero(reimburseDialog.formData.loanAmount),
            reimburseAmount: coverBlankToZero(reimburseDialog.formData.reimburseAmount),
            travelCostAmount: coverBlankToZero(reimburseDialog.formData.travelCostAmount),
            travelSubsidyAmount: coverBlankToZero(reimburseDialog.formData.travelSubsidyAmount),
            otherAmount: coverBlankToZero(reimburseDialog.formData.otherAmount),

            travelList: coverNullToEmptyArray(reimburseDialog.formData.travelList),
            subsidyList: coverNullToEmptyArray(reimburseDialog.formData.subsidyList),
            localTravelList: coverNullToEmptyArray(reimburseDialog.formData.localTravelList)
        }

        proxy.$http("/mis/travel/expense/create-travel-expense", "POST", data, true, function (resp) {
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

function deleteTableRows(id,instanceId) {
    proxy.$confirm('确认撤销该条报销记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const data = {
            "id": id,
            "instanceId": instanceId
        }
        proxy.$http("/mis/travel/expense/delete-by-id", "POST", data, true, resp => {
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
        proxy.$upload("/mis/travel/expense/archive", formData, true, function (resp) {
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
        proxy.$upload("/mis/travel/expense/update-archive-images", formData, true, function (resp) {
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
@use "travel-expense";
</style>