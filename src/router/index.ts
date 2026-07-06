import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const history = createWebHistory();


const routes : Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: '/login',
		component: () => import('../views/login.vue')
	},
	{
		path: '/reset-password',
		name: '/reset-password',
		component: () => import('../views/reset-password.vue')
	},
	{
		"path": "/mis",
		component: () => import('../views/index.vue'),
		children: [
			{
				path: '/mis/home',
				name: '/mis/home',
				component: () => import('../views/home.vue'),
				meta: {
					title: '首页',
					isTab: false
				}
			},
			{
				path: '/mis/hrm/role',
				name: '/mis/hrm/role',
				component: () => import('../views/hrm/role.vue'),
				meta: {
					title: '角色管理',
					isTab: true
				}
			},
			{
				path: '/mis/hrm/role-detail',
				name: '/mis/hrm/role-detail',
				component: () => import('../views/hrm/role-detail.vue'),
				meta: {
					title: '角色详情',
					isTab: true
				}
			},
			{
				path: '/mis/hrm/user',
				name: '/mis/hrm/user',
				component: () => import('../views/hrm/user.vue'),
				meta: {
					title: '用户管理',
					isTab: true
				}
			},
            {
				path: '/mis/hrm/student',
				name: '/mis/hrm/student',
				component: () => import('../views/hrm/student.vue'),
				meta: {
					title: '学生管理',
					isTab: true
				}
			},
            {
				path: '/mis/exam',
				name: '/mis/exam',
				component: () => import('../views/exam.vue'),
				meta: {
					title: '生成考题',
					isTab: true
				}
			},
			
		]
	},

	{
		path: '/404',
		name: '/404',
		component: () => import('../views/404.vue')
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/404'
	}
];
const router = createRouter({
	history,
	routes
});

router.beforeEach((to, from, next) => {
	let permissions = localStorage.getItem('permissions');
	let roles = localStorage.getItem('roles');
	let token = localStorage.getItem('token');
	let fullPath = to.fullPath;
	if (fullPath.startsWith("/mis")) {
		if (permissions == null || permissions == "" || roles == null || roles == "" || token == null || token == "") {
			return next({ name: '/login' });
		}
		else {
			return next();
		}
	}
	else {
		return next();
	}
});

export default router;