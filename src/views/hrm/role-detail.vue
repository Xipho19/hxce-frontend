<template>
    <div id="role-detail" v-if="proxy.isAuth(['ROOT', 'ROLE:INSERT', 'ROLE:UPDATE'])" class="role-detail-container">
        <div style="padding:10px; background:#f5f7fa; margin:10px;">
            <h4>调试信息：</h4>
            <div>权限数据：{{ JSON.stringify(systemicPermission) }}</div>
            <div>关联用户数据：{{ JSON.stringify(associatedUser) }}</div>
        </div>
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
                    <el-text class="user-info" :title="user.name + '&#45;&#45; ' + user.status"
                        truncated>
                        {{ user.name }} &#45;&#45; {{ user.status }}
                    </el-text>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, getCurrentInstance, ref, inject, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UserFilled } from '@element-plus/icons-vue'

const route = useRoute();
const router = useRouter();
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
    id: null,
    roleName: null,
    remark: null,
    status: "1",
    permissions: []
});

const rule = reactive({
    roleName: [
        { required: true, message: '请输入角色名称' },
        { pattern: '^[a-zA-Z0-9\\u4e00-\\u9fa5_\\-]{1,20}$', message: '角色名称格式不正确' },
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

function loadSystemicPermission() {
    proxy.$http("/permission/searchSystemicPermissions", "GET", null, false, resp => {
        console.log("权限接口返回：", resp);
        let data = resp.data;
        if (data.permissions && data.permissions.length > 0) {
            // 重置 systemPermission 数组，添加 checked 状态
            data.permissions.forEach(module => {
                module.checked = false;
                if (module.permissions) {
                    module.permissions.forEach(permission => {
                        permission.checked = false;
                        permission.name = permission.permissionName || permission.name;
                    });
                }
            });
            // 更新 reactive 数组
            systemicPermission.length = 0;
            data.permissions.forEach(module => {
                systemicPermission.push(module);
            });
            
            // 如果是编辑模式，重新设置权限选中状态
            if (formData.id && formData.permissions.length > 0) {
                updatePermissionCheckState();
            }
        }
    });
}

function updatePermissionCheckState() {
    systemicPermission.forEach(module => {
        if (module.permissions) {
            module.permissions.forEach(perm => {
                perm.checked = formData.permissions.includes(perm.id);
            });
            module.checked = module.permissions.every(p => p.checked);
        }
    });
}

function loadAssociatedUser() {
    if (!queryParams.id) {
        return;
    }
    const data = {
        id: queryParams.id
    }
    proxy.$http("/role/searchRoleUsers", "POST", data, false, resp => {
        console.log("关联用户接口返回：", resp);
        let data = resp.data;
        if (data.userList) {
            associatedUser.list = data.userList;
            associatedUser.count = data.userList.length;
        }
    });
}

function loadNextPage() {
    // 无限滚动加载下一页的逻辑
    // 暂时先留空，因为我们的后端可能没有分页查询角色用户的接口
}

function saveSubmit() {
    proxy.$refs.roleForm.validate((valid) => {
        if (valid) {
            let url = null;
            let data = {
                roleName: formData.roleName,
                remark: formData.remark,
                status: formData.status,
                permissions: formData.permissions
            };
            
            if (formData.id) {
                url = "/role/update";
                data.id = formData.id;
            } else {
                url = "/role/insert";
            }
            
            proxy.$http(url, "POST", data, false, resp => {
                proxy.$message({
                    type: 'success',
                    message: '保存成功',
                    duration: 1200,
                    onclose: () => {
                        // 保存成功后关闭标签页并返回角色管理页面
                        if (removeTab) {
                            removeTab();
                        }
                        router.push('/mis/hrm/role');
                    }
                });
            });
        }
    });
}

function resetRoleInfo() {
    proxy.$refs.roleForm.resetFields();
    if (formData.id) {
        // 如果是编辑模式，重新加载原始数据
        loadRoleInfo();
    } else {
        // 如果是新增模式，重置为默认值
        formData.roleName = null;
        formData.remark = null;
        formData.status = "1";
        formData.permissions = [];
        // 重置权限选择状态
        systemicPermission.forEach(module => {
            module.checked = false;
            module.permissions.forEach(perm => {
                perm.checked = false;
            });
        });
    }
}

function moduleCheckedChange(checked, module) {
    // 模块全选/取消全选
    if (module.permissions) {
        module.permissions.forEach(permission => {
            permission.checked = checked;
        });
    }
    // 更新 formData.permissions
    updateSelectedPermissions();
}

function permissionCheckedChange(checked, permission, module) {
    // 权限选择变化
    // 检查模块是否全选
    if (module.permissions) {
        const allChecked = module.permissions.every(p => p.checked);
        module.checked = allChecked;
    }
    // 更新 formData.permissions
    updateSelectedPermissions();
}

function updateSelectedPermissions() {
    // 更新选中的权限ID列表
    formData.permissions = [];
    systemicPermission.forEach(module => {
        if (module.permissions) {
            module.permissions.forEach(permission => {
                if (permission.checked) {
                    formData.permissions.push(permission.id);
                }
            });
        }
    });
}

function loadRoleInfo() {
    if (!queryParams.id) {
        return;
    }
    const data = {
        id: queryParams.id
    };
    proxy.$http("/role/searchById", "POST", data, false, resp => {
        let data = resp.data;
        if (data) {
            formData.id = data.id;
            formData.roleName = data.roleName;
            formData.remark = data.remark;
            formData.status = String(data.status);
            
            // 解析权限JSON
            if (data.permissions) {
                try {
                    const permissions = JSON.parse(data.permissions);
                    formData.permissions = permissions;
                    // 设置权限选中状态
                    if (systemicPermission.length > 0) {
                        updatePermissionCheckState();
                    }
                } catch (e) {
                    console.error("解析权限数据失败", e);
                }
            }
        }
    });
}

onMounted(() => {
    // 初始化加载
    loadSystemicPermission();
    if (queryParams.id) {
        loadRoleInfo();
        loadAssociatedUser();
    }
});

</script>

<style scoped lang="scss">
@use 'role-detail';
</style>