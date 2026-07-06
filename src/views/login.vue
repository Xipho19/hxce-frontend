<template>
	<div class="login-page">
		<div class="panel">
			<div class="left">
				<img src="../assets/login/logo.png" class="logo" />
				<img src="../assets/login/big.png" class="big" />
			</div>
			<div class="right">
				<div class="title-container">
					<h2>华夏<em>HXCE</em>智慧教学系统</h2>
				</div>

				<div>
					<div class="row">
						<el-input v-model="loginForm.phone" placeholder="手机号码" maxlength="11" prefix-icon="cellphone"
							size="large" clearable />
					</div>
					<div class="row">
						<el-input v-model="loginForm.smsCode" placeholder="短信验证码" size="large" maxlength="6"
							prefix-icon="message" clearable>
						</el-input>
						<el-button size="large" class="receive-btn" type="primary" plain
							:disabled="loginForm.btnDisabled" @click="sendSmsCode">
							{{ loginForm.btnContent }}
						</el-button>
					</div>
					<div class="row">
						<el-button type="primary" class="btn" size="large" @click="login">
							登录系统
						</el-button>
					</div>
					<div class="row"><a class="link" @click="">更换手机号</a></div>
				</div>
			</div>
		</div>
	</div>

</template>

<script lang="ts" setup>
	import { getCurrentInstance, reactive, ref } from 'vue';

	//当用户登陆成功后，需要使用路由对象跳转页面
	import router from '../router/index';
	import { isUsername, isPassword, isBlank, isPhoneNumber, isSmsCaptcha } from '../utils/validate';
import { error } from 'jquery';
import { locale } from 'dayjs';

	const { proxy } = getCurrentInstance();

	const loginForm = reactive({
		phone: null,
		smsCode: null,
		btnContent: '获取短验证码',
		btnDisabled: false,
		num: 0,
		timer: null
	});
	
	function sendSmsCode(){
		if(isBlank(loginForm.phone)){
			proxy.$message({
				message:"请填写手机号码",
				type: "error",
				duration:1200
			})
		}
		else if(isPhoneNumber(loginForm.phone)==false){
			proxy.$message({
				message:"手机号码错误",
				type: "error",
				duration:1200
			})
		}
		else{
			let data={
				"phone":loginForm.phone
			}
			proxy.$http("/user/sendSmsCode","Post",data,true,function(resp){
				if(resp.code==200){
					proxy.$message({
						message:"验证码已发送",
						type: "success",
						duration:1200
					})
				}
				loginForm.btnDisabled=true;
				loginForm.btnContent="60秒后重新获取"
				//开始倒计时
				loginForm.num=60
				//创建定时器
				loginForm.timer=setInterval(function(){
					loginForm.num-=1
					loginForm.btnContent=loginForm.num+"秒后重新获取"
					if(loginForm.num==0){
						//撤销定时器
						clearInterval(loginForm.timer)
						loginForm.btnContent="获取验证码"
						loginForm.btnDisabled=false;
					}
				},1000)
			})
		}
	}
	function login(){
		if(isBlank(loginForm.phone)){
			proxy.$message({
				message:"请填写手机号码",
				type: "error",
				duration:1200
			})
		}
		else if(isPhoneNumber(loginForm.phone)==false){
			proxy.$message({
				message:"手机号码错误",
				type: "error",
				duration:1200
			})
		}
		else if(isBlank(loginForm.smsCode)){
			proxy.$message({
				message:"请填写验证码",
				type: "error",
				duration:1200
			})
		}
			
		else if(isSmsCaptcha(loginForm.smsCode)==false){
			proxy.$message({
				message:"验证码错误",
				type: "error",
				duration:1200
			})
		}
			
		else{
			let data={
				'phone':loginForm.phone,
				"smsCode":loginForm.smsCode
			}
			proxy.$http("/user/login","Post",data,true,function(resp){
				let roles=resp.data.roles
				let permissions=resp.data.permissions
				localStorage.setItem("roles",JSON.stringify(roles))
				localStorage.setItem("permissions",JSON.stringify(permissions));
				router.push("/mis/home")
			})
		}
	}


	
</script>

<style lang="scss" scoped>
	@use "login";
</style>