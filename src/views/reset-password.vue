<template>
    <div class="reset-password-page">
        <div class="panel">
            <h3 class="title">重新设置密码</h3>
            <el-alert title="重置密码后，该账户所有登陆的客户端将会被强制下线，请谨慎操作！" type="warning"
                      :closable="false"/>
            <div class="row">
                <fieldset>
                    <legend>输入新密码</legend>
                    <input type="password" class="input" v-model="restPasswordForm.newPassword"/>
                </fieldset>
            </div>
            <div class="row">
                <fieldset>
                    <legend>重复输入密码</legend>
                    <input type="password" class="input" v-model="restPasswordForm.confirmPassword"/>
                </fieldset>
            </div>
            <div class="footer">
                <el-button type="cancel" @click="router.push('/login')" size="large">取消</el-button>
                <el-button type="primary" @click="resetPassword" size="large">重置密码</el-button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import router from "@/router";
import {getCurrentInstance, reactive, ref} from "vue";
import {isBlank, isPassword} from "@/utils/validate";

const {proxy} = getCurrentInstance();

const restPasswordForm = reactive({
    newPassword: null,
    confirmPassword: null,
});

function resetPassword() {
    if (isBlank(restPasswordForm.newPassword)) {
        proxy.$message({
            type: "error",
            message: "新密码不能为空",
            duration: 1200
        })
    }
    else if (!isPassword(restPasswordForm.newPassword)) {
        proxy.$message({
            type: "error",
            message: "新密码格式不正确",
            duration: 1200
        })
    }
    else if (isBlank(restPasswordForm.confirmPassword)) {
        proxy.$message({
            type: "error",
            message: "确认密码不能为空",
            duration: 1200
        })
    }
    else if (!isPassword(restPasswordForm.confirmPassword)) {
        proxy.$message({
            type: "error",
            message: "确认密码格式不正确",
            duration: 1200
        })
    }
    else if (restPasswordForm.newPassword !== restPasswordForm.confirmPassword) {
        proxy.$message({
            type: "error",
            message: "两次输入的密码不一致",
            duration: 1200
        })
    }
    else {
        const data = {
            password: restPasswordForm.newPassword
        }
        proxy.$http("/mis/user/reset-password", "POST", data, true, resp => {
            let result = resp.result
            if (result.status == "SUCCESS") {
                proxy.$message({
                    type: "success",
                    message: "密码重置成功！",
                    duration: 2000,
                    onClose: () => {
                        router.push('/login')
                    }
                })
                localStorage.removeItem("token")
            }
            else {
                proxy.$message({
                    type: "error",
                    message: "密码重置失败",
                    duration: 1200
                })
            }
        })
    }
}


</script>

<style lang="scss" scoped>
@use "reset-password";
</style>