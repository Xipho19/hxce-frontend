<template>
    <div id="dailyReport">
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
                <el-date-picker v-model="formData.dateRange" type="daterange" range-separator="~"
                                value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"
                                class="search-input-daterange"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Edit"
                           @click="showDialog()">
                    撰写日报
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
                  v-loading="tableData.loading" :scrollbar-always-on="false" @expand-change="expand"
                  :row-key="tableData.getRowKeys" :expand-row-keys="tableData.expands" border>
            <el-table-column type="expand">
                <template #default="scope">
                    <div class="expand-container">
                        <div class="daily-report-content" v-html="scope.row.content"></div>
                        <div class="recipient-container">
                            <div class="separator">
                                <span><el-icon class="icon"><OfficeBuilding/></el-icon>接收人</span>
                            </div>
                            <ul class="recipient-list">
                                <li class="recipient-list-item" v-for="item in scope.row.recipient" :key="item">
                                    <div class="user">
                                        <img src="../../assets/ifc/user.png"/>
                                        <div class="user-info">
                                            <div class="name">{{ item.name }}</div>
                                            <div class="deptName">
                                                <el-icon>
                                                    <SvgIcon name="dept_fill" class="icon-svg"/>
                                                </el-icon>
                                                <span>{{ item.deptName }}</span>
                                            </div>
                                            <div class="jobName">
                                                <el-icon>
                                                    <SvgIcon name="job_fill" class="icon-svg"/>
                                                </el-icon>
                                                <span>{{ item.jobName }}</span>
                                            </div>
                                        </div>
                                    </div>

                                </li>
                            </ul>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="姓名" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column prop="deptName" header-align="center" align="center" label="部门名称"
                             min-width="180" show-overflow-tooltip/>
            <el-table-column prop="jobName" header-align="center" align="center" label="职务" min-width="150"
                             show-overflow-tooltip/>
            <el-table-column prop="date" align="center" label="日报日期" min-width="150"
                             show-overflow-tooltip/>
            <el-table-column prop="createTime" align="center" label="提交时间" min-width="180"
                             show-overflow-tooltip/>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="scope.row.isOwner==false"
                               @click="showDialog(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary" :disabled="scope.row.isOwner==false"
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
        <el-dialog :title="dialog.formData.id? '编辑日报' : '新增日报'" v-model="dialog.visible" width="715"
                   :close-on-click-modal="false">
            <el-form :model="dialog.formData" ref="dialogForm" :rules="dialog.rule" label-width="80px">
                <el-form-item label="日报日期" prop="date">
                    <el-date-picker v-model="dialog.formData.date" placeholder="输入日期" value-format="YYYY-MM-DD"
                                    class="dialog-input"/>
                    <span class="dialog-input-description">日报必须当日提交，遇特殊情况需向上级申请延期提交日报。</span>
                </el-form-item>
                <el-form-item label="接收人" prop="recipient">
                    <el-select v-model="dialog.formData.recipient" placeholder="请选择接收人"
                               multiple filterable clearable>
                        <el-option v-for="item in dialog.formData.users" :key="item.value" :label="item.label"
                                   :value="item.value"/>
                    </el-select>
                </el-form-item>
                <div class="wangeditor-container">
                    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef"
                             :defaultConfig="toolbarConfig" :mode="mode"/>
                    <Editor style="height: 500px; overflow-y: hidden;" v-model="editorContent"
                            :defaultConfig="editorConfig" :mode="mode" @onCreated="createEditor"/>
                </div>
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
import {reactive, getCurrentInstance, ref, shallowRef, onBeforeUnmount} from 'vue';
import {Search, Plus, Delete} from "@element-plus/icons-vue";
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {isBlank} from "@/utils/validate";
import SvgIcon from "@/components/SvgIcon.vue";

const {proxy} = getCurrentInstance();

/** 响应对象区域 *********************************************************/

const formData = reactive({
    name: null,
    deptId: null,
    deptList: [],
    dateRange: null,
    modeLabel: "全部",
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


const rule = reactive({
    name: [
        {pattern: '^[\u4e00-\u9fa5]{1,20}$', message: '姓名格式不正确', trigger: 'blur'}
    ],
});

const dialog = reactive({
    visible: false,
    formData: {
        date: null,
        users: [],
        recipient: [],
        content: null,

    },
    rule: {
        date: [
            {required: true, message: "请选择日期", trigger: "blur"}
        ],
        recipient: [
            {type: "array", required: true, message: "请至少选择一个接收人", trigger: "blur"}
        ],
        content: [
            {required: true, message: "日报内容不能为空", trigger: "blur"}
        ]
    }
});

/*
 * WangEditor编辑器实例。
 * shallowRef只会在组件渲染时更新，不会触发重新渲染。
 * 因此可以用于避免编辑富文本内容的时候编辑器实例被重新渲染，从而导致编辑器状态丢失。
 */
const editorRef = shallowRef();
const editorContent = ref("");
// 工具栏配置
const toolbarConfig = {
    toolbarKeys: [
        "headerSelect",  // 标题选择
        'bold', // 加粗
        'italic', // 斜体
        'through', // 删除线
        'underline', // 下划线
        'justifyCenter', // 居中对齐
        'justifyJustify', // 两端对齐
        'justifyLeft', // 左对齐
        'justifyRight', // 右对齐
        'bulletedList', // 无序列表
        'numberedList', // 有序列表
        'color', // 文字颜色
        'insertLink', // 插入链接
        'fontSize', // 字体大小
        'lineHeight', // 行高
        'delIndent', // 缩进
        'indent', // 增进
        'divider', // 分割线
        'insertTable', // 插入表格
        'undo', // 撤销
        'redo', // 重做
        'clearStyle', // 清除格式
        // 'fullScreen', // 全屏
        "blockquote", // 引用
        // "codeBlock", // 代码块
        // "insertImage", // 插入图片
        // "uploadImage", // 上传图片
        // "insertVideo", // 插入视频
    ]
}


// 富文本编辑器配置
const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
        uploadImage: {
            server: `${proxy.$baseUrl}/mis/notice/upload-image`,
            fieldName: 'image',
            // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
            allowedFileTypes: ["image/jpg", "image/jpeg", "image/png"],
            headers: {
                token: localStorage.getItem("token"),
            },
            maxFileSize: 300 * 1024, // 上传文件不能超过300KB
            timeout: 15 * 1000, // 上传超时时间，单位为毫秒,
            customInsert(resp: any, insertFn: InsertFnType) {
                if (resp.code == 200) {
                    let url = `${proxy.$minioUrl}${resp.result.path}`;
                    let alt = resp.result.path;
                    insertFn(url, alt, "");
                }
                else {
                    proxy.$message({
                        message: '图片上传失败',
                        type: 'error',
                        duration: 1200
                    });
                }
            }
        }
    }
}

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
        mine: (formData.modeLabel == "我的") ? true : false,
        page: tableData.pageIndex,
        length: tableData.pageSize
    }
    proxy.$http("/mis/daily/report/search-by-page", "POST", data, true, resp => {
        let result = resp.result;
        if (result.status == "SUCCESS") {
            let page = result.page;
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

function expand(row, expandedRows) {
    if (expandedRows.length > 0) {
        tableData.expands = [];
        let data = {
            id: row.id
        };
        proxy.$http('/mis/daily/report/search-detail', 'POST', data, false, function (resp) {
            let result = resp.result;
            if (result.status === "SUCCESS") {
                row.content = result.content
                row.recipient = result.recipient
                tableData.expands.push(row.id);
            }
        });
    }
    else {
        tableData.expands = [];
    }
}

function showDialog(id) {
    dialog.formData.id = (id) ? id : null;
    editorContent.value = "";
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs.dialogForm.resetFields();
        //加载用户列表
        let data = {
            status: 1
        }
        proxy.$http("/mis/user/search-all-user", "POST", data, false, function (resp) {
            let result = resp.result;
            if (result.status == "SUCCESS") {
                dialog.formData.recipient = []
                result.userList.forEach(one => {
                    dialog.formData.users.push({"label": one.name, "value": one.id})
                });
            }
        });
        if (id) {
            data={
                id: id
            }
            proxy.$http("/mis/daily/report/search-by-id", "POST", data, false, function (resp) {
                let result = resp.result;
                console.log(result)
                if (result.status == "SUCCESS") {
                    dialog.formData.date = result.dailyReport.date
                    dialog.formData.recipient = result.dailyReport.recipient
                    editorContent.value = result.dailyReport.content
                }
            });
        }
    })
}

function saveSubmit() {
    proxy.$refs.dialogForm.validate((valid) => {
        if (valid) {
            let data = {
                id: dialog.formData.id,
                date: dialog.formData.date,
                recipient: dialog.formData.recipient,
                content: editorContent.value
            }

            let url = null
            if (dialog.formData.id) {
                url = "/mis/daily/report/update"
            }
            else {
                url = "/mis/daily/report/insert"
            }
            proxy.$http(url, "POST", data, true, resp => {
                let result = resp.result;
                if (result.status == "SUCCESS") {
                    proxy.$message({
                        type: 'success',
                        message: '保存成功',
                        duration: 1200,
                        onClose: () => {
                            dialog.visible = false;
                            loadTableData();
                        }
                    });
                }
            })
        }

    })
}

function deleteTableRows(id) {
    proxy.$confirm('确认删除该日报记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const data = {
            "id": id
        }
        proxy.$http("/mis/daily/report/delete-by-id", "POST", data, true, resp => {
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

// 富文本编辑器销毁时，也及时销毁编辑器对象
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

//创建富文本编辑器的时候，将编辑器对象保存到全局变量中
function createEditor(editor) {
    editorRef.value = editor
}
</script>
<style scoped lang="scss">
@use "daily-report";
</style>