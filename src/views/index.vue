<template>
	<div class="site-wrapper" :class="{ 'site-sidebar--fold': sidebar.sidebarFold }">
		<nav class="site-navbar" :class="{ 'site-navbar--fold': sidebar.sidebarFold }">
			<div class="site-navbar__header">
				<h1 class="site-navbar__brand">
					<a class="site-navbar__brand-lg">华夏CE智慧教学</a>
					<a class="site-navbar__brand-mini">CE</a>
				</h1>
			</div>
			<div class="navbar-container" :class="{'navbar-container--fold': sidebar.sidebarFold}">
				<div class="switch" @click="foldSwitch">
					<SvgIcon name="fold" class="icon-svg" />
				</div>
				<div class="right-container">
					<el-dropdown>
						<div class="el-dropdown-link user-info">
							<span class="avatar-container">
								<el-avatar shape="circle" :size="25" :src="userBaseInfo.photo"
									:icon="UserFilled"></el-avatar>
							</span>
							{{ userBaseInfo.name }}
						</div>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item @click="showResetPhotoDialog()">修改头像</el-dropdown-item>
								<el-dropdown-item @click="logout">退出</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</div>
		</nav>
		<aside class="site-sidebar site-sidebar--dark">
			<div class="site-sidebar__inner">
				<el-menu :default-active="siteContent.menuActiveName || 'Home'" :collapse="sidebar.sidebarFold"
					:collapseTransition="false" class="site-sidebar__menu" background-color="#263238"
					active-text-color="#fff" text-color="#8a979e">
					<el-menu-item index="Home" @click="$router.push('/mis/home')">
						<el-icon>
							<SvgIcon name="index_fill" class="icon-svg" />
						</el-icon>
						<span slot="title">首页</span>
					</el-menu-item>
					<el-sub-menu index="组织机构" :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
						<template #title>
							<el-icon>
								<SvgIcon name="organization_fill" class="icon-svg" />
							</el-icon>
							<span slot="title">组织架构</span>
						</template>
						<el-menu-item index="/mis/hrm/role" v-if="proxy.isAuth(['ROOT','ROLE:SELECT'])"
							@click="$router.push('/mis/hrm/role')">
							<el-icon>
								<SvgIcon name="role_fill" class="icon-svg" />
							</el-icon>
							<span slot="title">角色管理</span>
						</el-menu-item>
						<el-menu-item index="/mis/hrm/user" v-if="proxy.isAuth(['ROOT','USER:SELECT'])"
							@click="$router.push('/mis/hrm/user')">
							<el-icon>
								<SvgIcon name="user_fill" class="icon-svg" />
							</el-icon>
							<span slot="title">用户管理</span>
						</el-menu-item>
                        <el-menu-item index="/mis/hrm/student" v-if="proxy.isAuth(['ROOT','STUDENT:SELECT'])"
							@click="$router.push('/mis/hrm/student')">
							<el-icon>
								<SvgIcon name="user_fill" class="icon-svg" />
							</el-icon>
							<span slot="title">学生管理</span>
						</el-menu-item>

					</el-sub-menu>
					<el-sub-menu index="智慧教学" :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
						<template #title>
							<el-icon>
								<SvgIcon name="desk_fill" class="icon-svg" />
							</el-icon>
							<span slot="title">智慧教学</span>
						</template>
						<el-menu-item index="/mis/exam" @click="$router.push('/mis/exam')">
							<el-icon>
								<SvgIcon name="daily-report_fill" class="icon-svg" />
							</el-icon>
							<span slot="title">课堂练习</span>
						</el-menu-item>
					</el-sub-menu>
				</el-menu>

			</div>
		</aside>
		<div class="site-content__wrapper">
			<main class="site-content" :class="{ 'site-content--tabs': $route.meta.isTab }">
				<el-tabs v-if="$route.meta.isTab" v-model="siteContent.mainTabsActiveName" :closable="true"
					@tab-click="selectedTab" @tab-remove="removeTab">
					<el-tab-pane v-for="item in siteContent.mainTabs" :label="item.title" :name="item.name">
					</el-tab-pane>
					<el-card :body-style="siteContent.siteContentViewHeight">
						<router-view v-slot="{Component}">
							<keep-alive :include="cachedViews">
								<component :is="Component" />
							</keep-alive>

						</router-view>
					</el-card>
				</el-tabs>
				<el-card v-else :body-style="siteContent.siteContentViewHeight">
					<router-view :key="router.currentRoute.value.query.random" />
				</el-card>
			</main>
		</div>
	</div>

	<el-dialog title="修改头像" v-model="resetPhotoDialog.visible" width="505px" :close-on-click-modal="false">
		<div>
			<div class="tip">
				<el-alert title="成功修改头像后，该账户所有登陆的客户端将会显示新的头像，请谨慎操作！" type="warning" :closable="false"
					class="el-alert" />
			</div>
			<div class="reset-photo-container">
				<div class="left">
					<el-upload accept=".jpg,.jpeg" :show-file-list="false" :before-upload="beforeUploadPhoto">
						<div class="upload-container" v-if="!resetPhotoDialog.croppedPhoto">
							<img src="../assets/index/jpg.png" class="jpg">
							<span class="upload-text">选择图片</span>
						</div>
						<div v-if="resetPhotoDialog.croppedPhoto">
							<img class="leftPhoto" :src="resetPhotoDialog.croppedPhoto" />
						</div>
					</el-upload>
				</div>
				<div class="right">
					<div id="cropper-container" class="cropper-container">
						<img ref="rightPhoto" :src="resetPhotoDialog.localPhoto" />
					</div>
				</div>
			</div>
		</div>
		<template #footer>
			<el-button @click="resetPhotoDialog.visible = false">取消</el-button>
			<el-button type="primary" @click="handlePhoto()"
				:icon="resetPhotoDialog.btnText === '裁剪照片' ? 'Scissor' : 'Document'"
				:disabled="!resetPhotoDialog.localPhoto">{{ resetPhotoDialog.btnText }}
			</el-button>
		</template>
	</el-dialog>
</template>
<script setup lang="ts">
	import SvgIcon from '../components/SvgIcon.vue';
	import { UserFilled } from '@element-plus/icons-vue';
	import { isBlank, isPassword } from '../utils/validate';
	import { ref, reactive, provide, getCurrentInstance, watch, nextTick } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import Cropper from 'cropperjs';
	import 'cropperjs/dist/cropper.css';
	// import { Component, Vue, Watch } from 'vue-property-decorator';

	//用于获取路由参数
	const route = useRoute();
	//用于切换路由引用的页面
	const router = useRouter();
	const { proxy } = getCurrentInstance();

	//RouterView缓存的页面
	const cachedViews = ref([])

	//提供缓存的页面给子页面，子页面可以清理缓存的页面

	provide('cachedViews', cachedViews)

	//左边栏常量
	const sidebar = reactive({
		//是否折叠左边栏
		sidebarFold: false,
		sidebarLayoutSkin: 'dark',
	});

	//内容区响应对象（后续用到）
	const siteContent = reactive({
		documentClientHeight: 0,
		siteContentViewHeight: {},
		height: null,
		mainTabs: [],
		mainTabsActiveName: '',
		menuActiveName: ''
	});

	//用户信息常量
	const userBaseInfo = reactive({
		name: '',
		photo: '',
	});

	const siteContentHeight = ref(0)


	const resetPhotoDialog = reactive({
		visible: false,
		cropper: null,
		croppedPhoto: null,
		localPhoto: null,
		btnText: '裁剪照片'
	});

	//查询用户基本信息（初始执行）
	function searchUserInfo() {
		proxy.$http("/user/searchUserInfoById", "GET", null, true, resp => {
			let data = resp.data
			userBaseInfo.name = data.name;
			if (data.photo) {
				userBaseInfo.photo = proxy.$minioUrl + data.photo + "?random=" + new Date().getTime();
			}
		})

	}

	searchUserInfo();


	function beforeUploadPhoto(file) {
		resetPhotoDialog.croppedPhoto = null;
		const reader = new FileReader();

		reader.onload = () => {
			resetPhotoDialog.localPhoto = null;
			resetPhotoDialog.localPhoto = reader.result;
			nextTick(() => {
				if (resetPhotoDialog.cropper) {
					resetPhotoDialog.cropper.destroy();
				}

				// 初始化Cropper
				resetPhotoDialog.cropper = new Cropper(proxy.$refs.rightPhoto, {
					aspectRatio: 1 / 1, // 裁剪比例
					viewMode: 1,
					zoomOnWheel: true,
					autoCropArea: 0.8
				});
			});
		};
		reader.readAsDataURL(file);
		return false; // 阻止默认上传
	};


	function handlePhoto() {
		if (resetPhotoDialog.btnText === '裁剪照片') {
			if (isBlank(resetPhotoDialog.localPhoto)) {
				proxy.$message({
					type: 'error',
					message: '请选择图片',
					duration: 1200
				})
				return;
			}
			resetPhotoDialog.btnText = '保存修改';
			if (resetPhotoDialog.cropper) {
				//获取裁剪内容（Base64图片字符串），并且显示在页面中
				resetPhotoDialog.croppedPhoto = resetPhotoDialog.cropper.getCroppedCanvas().toDataURL("image/jpg");
			}
		}
		else {
			const formData = new FormData();
			const blob = proxy.$base64ToBlob(resetPhotoDialog.croppedPhoto);
			formData.append('photo', blob, 'photo.jpg');
			proxy.$upload("/mis/user/reset-photo", formData, true, function (resp) {
				let result = resp.result
				if (result.status === 'SUCCESS') {
					proxy.$message({
						type: 'success',
						message: '头像修改成功',
						duration: 1200
					})
					searchUserBaseInfo();
				}
				else {
					proxy.$message({
						type: 'error',
						message: '头像修改失败',
						duration: 1200
					})
				}
			})

			resetPhotoDialog.visible = false;
			resetPhotoDialog.btnText = '裁剪照片';
			resetPhotoDialog.croppedPhoto = null;
			resetPhotoDialog.localPhoto = null;
			if (resetPhotoDialog.cropper) {
				resetPhotoDialog.cropper.destroy();
				resetPhotoDialog.cropper = null;
			}
		}
	}


	function logout() {
		proxy.$http('/user/logout', 'GET', null, true, resp => {
			localStorage.clear();
			router.push('/login');
		})
	}



	function showResetPhotoDialog() {
		resetPhotoDialog.visible = true;
		resetPhotoDialog.croppedPhoto = null;
		resetPhotoDialog.localPhoto = null;
		resetPhotoDialog.btnText = '裁剪照片';
		if (resetPhotoDialog.cropper) {
			resetPhotoDialog.cropper.destroy();
			resetPhotoDialog.cropper = null;
		}
	}


	function routeHandle(route) {
		resetDocumentClientHeight()
		loadSiteContentViewHeight()
		//判断是否要创建Tab控件
		if (route.meta.isTab) {
			/* 创建Tab控件之前，先判断mainTabs[]数组中是否存在该Vue页面的Tab控件。
			 * 比如我们要访问角色管理页面，程序先要判断是否存在角色管理页面的Tab控件。
			 * 如果不存在就创建Tab控件；如果存在就不创建新的Tab控件，直接切换到现有的Tab控件
			 */
			let tab = siteContent.mainTabs.filter(item => item.name === route.name)[0];
			if (tab == null) {
				tab = {
					title: route.meta.title,
					name: route.name
				};
				siteContent.mainTabs.push(tab);
			}
			//选中某个Tab控件
			siteContent.mainTabsActiveName = tab.name;
			//选中某个菜单项
			siteContent.menuActiveName = tab.name;

			//缓存该页面
			let array = route.name.split('/')
			let pageName = array.pop()
			if (!cachedViews.value.includes(pageName)) {
				cachedViews.value.push(pageName)
			}

		}
		else {
			siteContent.mainTabs = []
			//取消选中某个Tab控件
			siteContent.mainTabsActiveName = "";
			//选中某个菜单项
			siteContent.menuActiveName = "Home";
		}
	}

	/*
	 * 载入框架页面就立即执行routeHandle()函数，把当前路由加载页面对应的Tab控件选中
	 * 例如直接访问http://localhost:7600/mis/role页面，需要让框架页面创建Tab控件，并且选中该Tab
	 */
	routeHandle(route)

	/*
	 * 框架页面的路由标签每次切换引用的页面，就调用routeHandle()，
	 * 判断一下是创建新的Tab控件，还是切换到现有的Tab控件
	 */
	watch(
		() => route.path,
		(newPath) => {
			routeHandle(route)
		},
		{ immediate: true, deep: true }
	);

	function resetDocumentClientHeight() {
		siteContent.documentClientHeight = document.documentElement.clientHeight
	}


	function loadSiteContentViewHeight() {
		let height = siteContent.documentClientHeight - 50 - 30 - 1;
		if (route.meta.isTab) {
			height -= 40;
		}

		siteContent.height = height
		siteContent.siteContentViewHeight = { minHeight: height + "px", display: "flex", flexDirection: "column" }

		siteContentHeight.value = height
		//把内容区的高度传递给子页面
		provide("siteContentHeight", siteContentHeight)

	}

	window.onresize = () => {
		siteContent.documentClientHeight = document.documentElement.clientHeight
		loadSiteContentViewHeight()
	}


	function selectedTab(tab) {
		router.push({
			//想必很多同学现在才恍然大悟，为什么要用Vue页面的路由名称作为Tab面板的名字
			name: tab.paneName
		});
	}

	function removeTab(tabName) {
		//让mainTabs数组剔除要关闭的Tab
		siteContent.mainTabs = siteContent.mainTabs.filter(item => item.name !== tabName);
		//如果还存在剩余的Tab，就切换到最后的Tab上面
		if (siteContent.mainTabs.length >= 1) {
			//获取mainTabs数组最后一个元素
			let tab = siteContent.mainTabs[siteContent.mainTabs.length - 1];
			//选中这个Tab控件
			siteContent.mainTabsActiveName = tab.name;
			//内容区切换引用的页面
			router.push({ name: tab.name });

			//删除该页面的缓存
			let array = tabName.split('/')
			let index = cachedViews.value.indexOf(array.pop())
			if (index !== -1) {
				cachedViews.value.splice(index, 1)
			}

			//如果关闭的是role-detail页面，还需要连带着删除role页面的缓存，这样切换到role页面的时候，就能加载最新的角色数据
			if (tabName === "/mis/hrm/role-detail") {
				let roleIndex = cachedViews.value.indexOf("role")
				if (roleIndex !== -1) {
					cachedViews.value.splice(roleIndex, 1)
				}
			}

		}
		else {
			siteContent.mainTabsActiveName = '';
			router.push("/mis/home");
		}
	}

	//把removeTab函数提供给子页面，便于子页面可以调用该函数关闭Tab
	provide("removeTab", removeTab)

	function foldSwitch() {
		sidebar.sidebarFold = !sidebar.sidebarFold;
	}
</script>

<style lang="scss">
	@use "index";
</style>