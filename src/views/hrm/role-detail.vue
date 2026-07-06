<template>
    <div id="role-detail" v-if="proxy.isAuth(['ROOT', 'ROLE:INSERT', 'ROLE:UPDATE'])" class="role-detail-container">
        <div class="left-container">
            <h3 class="container-title">角色信息</h3>
            <el-form ref="roleForm" :model="formData" label-width="80px" :rules="rule">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="formData.roleName"></el-input>
                </el-form-item>
                <el-form-item label="备注信息">
                    <el-input v-model="formData.remark" type="textarea" :rows="6" maxlength="200"></el-input>
                </el-form-item>
                <el-form-item label="角色状态" prop="status">
                    <el-radio-group v-model="formData.status">
                        <el-radio value="1">启用</el-radio>
                        <el-radio value="2">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <el-alert type="warning" show-icon :closable="false">
                <h3 class="alert-title">重要提示</h3>
                <p class="alert-content">
                    修改角色信息之后，该角色关联的用户所有终端设备都会被踢下线。修改角色信息请谨慎操作！
                </p>
            </el-alert>
            <div class="btn-container">
                <el-button type="primary" @click="saveSubmit">立即保存</el-button>
                <el-button @click="resetRoleInfo">信息重置</el-button>
            </div>
        </div>
        <div class="center-container">
            <h3 class="container-title">权限列表</h3>
            <el-scrollbar :height="permissionsHeight">
                <div class="module-container" v-for="module in systemicPermission" :key="module.moduleName">
                    <div class="header">
                        <el-checkbox class="module-name" v-model="module.checked"
                            @change="moduleCheckedChange($event, module)">
                            【 {{ module.moduleName }} 】
                        </el-checkbox>
                    </div>
                    <div class="body">
                        <table class="permission-table">
                            <tr>
                                <td class="permission-list-cell">
                                    <el-checkbox v-for="permission in module.permissions" :label="permission.name"
                                        :value="permission.id" :key="permission.id" v-model="permission.checked"
                                        @change="permissionCheckedChange($event, permission, module)">
                                    </el-checkbox>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </el-scrollbar>
        </div>
        <div class="right-container">
            <h3 class="container-title">关联用户列表（{{ associatedUser.count }}人）</h3>
            <ul class="user-list" v-infinite-scroll="loadNextPage" :style="userListStyle"
                infinite-scroll-immediate="false">
                <li class="user-item" v-for="user in associatedUser.list" :key="user.id">
                    <el-avatar shape="square" :icon="UserFilled" :size="20" :src="user.photo"></el-avatar>
                    <el-text class="user-info" :title="user.name + '(' + user.deptName + '） &#45;&#45; ' + user.status"
                        truncated>
                        {{ user.name }} &#45;&#45; {{ user.status }}
                    </el-text>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, getCurrentInstance, ref, inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import { UserFilled } from '@element-plus/icons-vue'

const route = useRoute();
const { proxy } = getCurrentInstance();


/** 响应对象区域 *********************************************************/

//获取路由参数
const queryParams = route.query;


//获取父页面传入的参数值
let siteContentHeight = inject('siteContentHeight');
const removeTab = inject('removeTab');


const userListStyle = ref(`height:${siteContentHeight.value - 40 - 60 - 83}px;`)
const permissionsHeight = ref(siteContentHeight.value - 40 - 83)

watch(siteContentHeight, (newValue, oldValue) => {
    userListStyle.value = `height:${newValue - 40 - 60 - 83}px;`
    permissionsHeight.value = newValue - 40 - 83
});


const formData = reactive({
    roleName: null,
    remark: null,
    status: "1",

});

const rule = reactive({
    roleName: [
        { required: true, message: '请输入角色名称' },
        { pattern: '^[a-zA-Z0-9\\u4e00-\\u9fa5_\\-]{1,20}\$', message: '角色名称格式不正确' },
        {
            validator: (rule, value, callback) => {
                const data = {
                    id: queryParams.id,
                    roleName: value
                }
                proxy.$http("/role/checkRoleNameConflict", "POST", data, false, resp => {
                    let data = resp.data;
                    if (!data.isConflict) {
                        callback()
                    }
                    else {
                        callback(new Error('角色名称已存在'))
                    }

                })
            },
            trigger: 'blur'
        }
    ],
    status: [
        { required: true, message: '请选择角色状态' }
    ]
})


const systemicPermission = reactive([])

const associatedUser = reactive({
    count: 0,
    list: [],
    pageIndex: 1,
    pageSize: 50
})

/** 函数定义区域 *********************************************************/


</script>

<style scoped lang="scss">
@use 'role-detail';
</style>