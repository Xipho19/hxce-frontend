<template>
    <div id="dept" v-if="proxy.isAuth(['ROOT', 'ROLE:SELECT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="角色名称" maxlength="20" class="search-input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['ROOT', 'ROLE:INSERT'])"
                    @click="showDetailPage()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['ROOT', 'ROLE:DELETE'])"
                    @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.statusLabel" @change="searchByCondition()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="正常">正常</el-radio-button>
                    <el-radio-button value="停用">停用</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>

        <el-table :data="tableData.dataList" :header-cell-style="{ 'background': '#f5f7fa', 'padding': '10px 0 !important' }"
            v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange"
            @expand-change="expand" :row-key="tableData.getRowKeys" :expand-row-keys="tableData.expands" border>
            <el-table-column type="expand">
                <template #default="scope">
                    <div class="user-list-container">
                        <ul class="user-list" v-if="scope.row.userList && scope.row.userList.length > 0">
                            <li v-for="one in scope.row.userList" :key="one.id">
                                <el-tooltip effect="dark" :content="one.name" placement="top-start"
                                    v-if="one.name.length > 3">
                                    <div class="user-item">
                                        <div class="user-avatar">
                                            <el-avatar shape="square" :size="45" :src="one.photo">
                                                <img src="../../assets/ogm/pic.png" alt="用户头像" />
                                            </el-avatar>
                                        </div>
                                        <el-text class="user-name" truncated>{{ one.name }}</el-text>
                                    </div>
                                </el-tooltip>
                                <div class="user-item" v-else>
                                    <div class="user-avatar">
                                        <el-avatar shape="square" :size="45" :src="one.photo">
                                            <img src="../../assets/ogm/pic.png" alt="用户头像" />
                                        </el-avatar>
                                    </div>
                                    <el-text class="user-name" truncated>{{ one.name }}</el-text>
                                </div>
                            </li>
                        </ul>
                        <el-empty :image-size="50" description="暂无在职用户" class="empty" v-else />
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center"
                width="50" />
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="roleName" header-align="center" align="center" label="角色名称" min-width="230"
                show-overflow-tooltip />
            <el-table-column prop="systemic" header-align="center" align="center" label="系统角色" min-width="140" />
            <el-table-column header-align="center" align="center" label="权限数量" min-width="130">
                <template #default="scope">
                    <span>{{ scope.row.permissions }} 个</span>
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" label="用户数量" min-width="130">
                <template #default="scope">
                    <span>{{ scope.row.userCount }} 人</span>
                </template>
            </el-table-column>
            <el-table-column prop="remark" header-align="center" align="left" label="备注信息" show-overflow-tooltip
                min-width="260" />
            <el-table-column header-align="center" align="center" label="状态" min-width="130">
                <template #default="scope">
                    <el-text :type="scope.row.status === '正常' ? 'success' : 'info'">{{ scope.row.status }}</el-text>
                </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'ROLE:UPDATE'])"
                        @click="showJobDetailPage(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary"
                        :disabled="!proxy.isAuth(['ROOT', 'ROLE:DELETE']) || (scope.row.userCount > 0)"
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
    </div>
</template>

<script setup lang="ts">
import { reactive, getCurrentInstance, ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus, Delete } from "@element-plus/icons-vue";

const router = useRouter();
const { proxy } = getCurrentInstance();
//获得RouterView缓存的页面
const cachedViews = inject('cachedViews');

/** 响应对象区域 *********************************************************/

const formData = reactive({
    name: null,
    statusLabel: '全部'
});

const rule = reactive({
    name: [
        { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5_\-]{1,20}$', message: '角色名称格式不正确', trigger: 'blur' }
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
        return row.id;
    }
});

/** 函数定义区域 *********************************************************/

</script>

<style scoped lang="scss"></style>