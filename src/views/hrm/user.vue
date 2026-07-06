<template>
    <div id="user" v-if="proxy.isAuth(['ROOT', 'USER:SELECT'])">
        <el-form :inline="true" :model="formData" :rules="rule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="formData.name" placeholder="姓名" maxlength="20" class="search-input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="roleId">
                <el-select v-model="formData.roleId" placeholder="角色" class="search-input" clearable="clearable"
                    filterable>
                    <el-option v-for="item in formData.roleList" :key="item.value" :label="item.roleName"
                        :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="searchByCondition()">查询</el-button>
                <el-button type="primary" icon="Plus" :disabled="!proxy.isAuth(['ROOT', 'USER:INSERT'])"
                    @click="showDialog()">
                    新增
                </el-button>
                <el-button type="danger" icon="Delete" :disabled="!proxy.isAuth(['ROOT', 'USER:DELETE'])"
                    @click="deleteTableRows()">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mode">
                <el-radio-group v-model="formData.statusLabel" @change="searchByCondition()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="正常">正常</el-radio-button>
                    <el-radio-button value="冻结">冻结</el-radio-button>
                    <el-radio-button value="离职">离职</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="tableData.dataList"
            :header-cell-style="{ 'background': '#f5f7fa', 'padding': '10px 0 !important' }"
            v-loading="tableData.loading" :scrollbar-always-on="false" @selection-change="selectionChange"
            @expand-change="expand" :row-key="tableData.getRowKeys" :expand-row-keys="tableData.expands" border>
            <el-table-column type="expand">
                <template #default="scope">
                    <div class="user-info-container">
                        <div class="left">
                            <el-avatar shape="square" :size="118" :src="scope.row.photo">
                                <img src="../../assets/ogm/pic.png" alt="用户头像" />
                            </el-avatar>
                        </div>
                        <div class="right">
                            <table class="user-info-table">
                                <tbody>
                                    <tr class="row">
                                        <td class="cell">关联角色：</td>
                                        <td class="cell">
                                            <el-tag type="primary" v-for="item in scope.row.roleList">
											{{ item }}
                                            </el-tag>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="selection" header-align="center" align="center" width="50" />
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号">
                <template #default="scope">
                    <span>{{ (tableData.pageIndex - 1) * tableData.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="姓名" min-width="180"
                show-overflow-tooltip />
            <el-table-column prop="gender" header-align="center" align="center" label="性别" min-width="150"
                show-overflow-tooltip />
            <el-table-column prop="phone" header-align="center" align="center" label="手机号" min-width="200" />

            <el-table-column prop="associatedRoles" header-align="center" align="center" label="关联角色" min-width="150">
                <template #default="scope">
                    {{ scope.row.associatedRoles }}个
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="150" />
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'USER:UPDATE'])"
                        @click="showDialog(scope.row.id)" link>
                        修改
                    </el-button>
                    <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'USER:DELETE'])"
                        @click="deleteTableRows(scope.row.id)" link>
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="pageSizeChange" @current-change="pageIndexChange"
            :current-page="tableData.pageIndex" :page-sizes="[2,10, 20, 50]" :page-size="tableData.pageSize"
            :total="tableData.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
        <el-dialog :title="dialog.formData.id ? '编辑用户信息' : '新增用户'" v-model="dialog.visible" width="450"
            :close-on-click-modal="false" v-if="proxy.isAuth(['ROOT', 'USER:INSERT', 'USER:UPDATE'])">
            <el-form ref="dialogForm" :model="dialog.formData" :rules="dialog.rule" label-width="80px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="dialog.formData.name" placeholder="姓名" maxlength="20" />
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                    <el-radio-group v-model="dialog.formData.gender">
                        <el-radio-button value="男">男</el-radio-button>
                        <el-radio-button value="女">女</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="dialog.formData.phone" placeholder="手机号码" maxlength="11" />
                </el-form-item>
                <el-form-item label="关联角色" prop="roleId">
                    <el-select v-model="dialog.formData.roleId" placeholder="关联角色" clearable="clearable" multiple
                        filterable>
                        <el-option v-for="item in formData.roleList" :key="item.id" :label="item.roleName"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="用户状态" prop="status">
                    <el-radio-group v-model="dialog.formData.status">
                        <el-radio value="正常">正常</el-radio>
                        <el-radio value="冻结">冻结</el-radio>
                        <el-radio value="离职">离职</el-radio>
                    </el-radio-group>
                </el-form-item>
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
import { reactive, getCurrentInstance } from 'vue';
import { Search, Plus, Delete } from "@element-plus/icons-vue";
import { SIZE_INJECTION_KEY } from 'element-plus';
import { da } from 'element-plus/es/locale';

const { proxy } = getCurrentInstance();

/** 响应对象区域 *********************************************************/

const formData = reactive({
    name: null,
    roleId: null,
    roleList: [],
    status: null,
    statusLabel: '全部'
});

const rule = reactive({
    name: [
        { pattern: '^[\u4e00-\u9fa5]{1,20}$', message: '姓名格式不正确', trigger: 'blur' }
    ]
});

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

const dialog = reactive({
    visible: false,
    formData: {
        id: null,
        name: null,
        gender: null,
        phone: null,
        roleId: [],
        status: "正常"
    },
    rule: {
        name: [
            { required: true, message: "请输入姓名" },
            { min: 2, max: 20, message: "长度在2到20个字符之间", trigger: "blur" },
            { pattern: "^[\u4e00-\u9fa5]{2,20}$", message: "用户名格式错误", trigger: "blur" }
        ],
        gender: [
            { required: true, message: '请选择性别' }
        ],
        phone: [
            { required: true, message: "请输入手机号码" },
            { pattern: "^1[34578]\\d{9}$", message: "手机号码格式错误", trigger: "blur" },
            {
                validator: (rule, value, callback) => {
                    const data = {
                        id: dialog.formData.id,
                        phone: value
                    }
                    proxy.$http("/user/existsByPhone", "POST", data, true, resp => {
                        let data = resp.data;
                        console.log(resp)
                        if (data.isConflict === false) {
                            callback();
                        }
                        else {
                            callback(new Error('手机号码已存在'));
                        }
                    })
                },
                trigger: "blur"
            }
        ],
        roleId: [
            { required: true, message: '请选择关联角色' }
        ],
        status: [
            { required: true, message: '请选择用户状态' }
        ]
    }

});


/** 函数定义区域 *********************************************************/
function loadRoleList(){
	proxy.$http("/role/searchAllRole","GET",null,true,function(resp){
		let roleList = resp.data.roleList
		// console.log(roleList)
		formData.roleList=roleList
	})
}
loadRoleList()

function loadTableData(){
	tableData.loading=true
	tableData.expands=[]
	let temp={
		"全部":null,
		"正常":1,
		"冻结":2,
		"离职":3
	}
	formData.status=temp[formData.statusLabel]
	
	let data={
		"name":formData.name,
		"roleId":formData.roleId,
		"status":formData.status,
		"page":tableData.pageIndex,
		"size":tableData.pageSize
	}
	
	proxy.$http("/user/searchByPage","POST",data,true,function(resp){
		let page =resp.data.page
		console.log(page)
		tableData.loading=false
		for(let one of page.list){
			let temp={
				"1":"正常",
				"2":"冻结",
				"3":"离职",
				
			}
			one.status=temp[one.status]
		}
		tableData.dataList=page.list
		tableData.totalCount=Number(page.totalCount)
	})
}

loadTableData()

function pageSizeChange(size){
	//第一页开始
	tableData.pageIndex=1
	tableData.pageSize=size
	loadTableData()
}
function pageIndexChange(index){
	tableData.pageIndex=index
	loadTableData()
}

function searchByCondition(){
	proxy.$refs.form.validate(function(valid){
		if(valid){
			tableData.pageIndex=1
			loadTableData()
		}
	})
}

function expand(row, expandRows){
	let userId=row.id
	let data={
		"userId":userId
	}
	proxy.$http("/role/searchUserRoles","POST",data,true,function(resp){
		let roleList=resp.data.roleList
		row.roleList=roleList
	})
}

function showDialog(id){
	dialog.formData.id = (id) ? id: null
	dialog.visible=true
	proxy.$nextTick(function(){
		proxy.$refs.dialogForm.resetFields()
		if(id){
			let data={
				"id":dialog.formData.id
			}
			proxy.$http("/user/searchById","POST",data,true,function(resp){
				let data=resp.data
				let temp={
					"正常":1,
					"冻结":2,
					"离职":3
				}
				data.status = temp[data.status];
				dialog.formData.name = data.name;
				dialog.formData.gender = data.gender;
				dialog.formData.phone = data.phone;
				dialog.formData.roleId = data.roles;
				dialog.formData.status = data.status;
			})
		}
	})
}

function saveSubmit()
{
	proxy.$refs.dialogForm.validate(function(valid){
		if(valid){
			let temp={
				"正常":1,
				"冻结":2,
				"离职":3
			}
			let data={
				"id":dialog.formData.id,
				"name": dialog.formData.name,
				"gender": dialog.formData.gender,
				"phone": dialog.formData.phone,
				"roles": dialog.formData.roleId,
				"status": temp[dialog.formData.status]
			}
			let url=null
			if(dialog.formData.id){
				url="/user/update"
			}
			else{
				url="/user/insert"
			}
			proxy.$http(url,"POST",data,true,function(resp){
				proxy.$message({
					type:'success',
					message:'保存成功',
					duration:1200,
					onclose:()=> {
						dialog.visible = false;
						loadTableData();
					}
				});
			})
		}
	})
}

function selectionChange(selection){
	tableData.selections=selection
}

function deleteTableRows(id){
	let ids=null
	if(id){
		ids=[id]
	}
	else{
		ids=tableData.selections.map(one=>one.id)
	}
	if(ids.length==0){
		proxy.$message({
			type:'warning',
			message:'请选择要删除的记录',
			duration:1200
		})
	}
	proxy.$confirm("确认删除选中记录？","提示",{
		confirmButtonText:'确认',
		cancelButtonText:'取消',
		type:'wraning'
	}).then(function(){
		let data={
			"ids":ids
		}
		proxy.$http("/user/deleteByIds","POST",data,true,function(resp){
			proxy.$message({
				message:'删除成功',
				type:'success',
				duration:1200,
				onclose:()=>{
					loadTableData();
				}
			})
		})
	})
}
</script>

<style scoped lang="scss">
@use "user";
</style>