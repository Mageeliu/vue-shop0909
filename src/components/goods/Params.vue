<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert :closable="false" show-icon
        title="注意：只允许为第三级分类设置相关参数" type="warning">
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys"
          :options="cateList" clearable
          :props="{
            expandTrigger: 'hover',
            value: 'cat_id',
            label: 'cat_name',
            children: 'children'
          }"
          @change="handleCateChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini"
          :disabled="isBtnDisabled"
          @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态表格参数 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(val,index) in scope.row.attr_vals"
                  :key="index"
                  closable @close="handleClose(scope.row,index)">
                  {{val}}
                </el-tag>
                <!-- 输入添加文本框及按钮 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini"
                icon="el-icon-edit"
                @click="showEditDialog(scope.row.attr_name,scope.row.attr_id)">修改</el-button>
                <el-button type="danger" size="mini"
                icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini"
          :disabled="isBtnDisabled"
           @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态表格参数 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(val,index) in scope.row.attr_vals"
                  :key="index"
                  closable @close="handleClose(scope.row,index)">
                  {{val}}
                </el-tag>
                <!-- 输入添加文本框及按钮 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini"
                icon="el-icon-edit"
                @click="showEditDialog(scope.row.attr_name,scope.row.attr_id)">修改</el-button>
                <el-button type="danger" size="mini"
                icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleTxt"
      :visible.sync="addDialogVisible"
      width="50%">
      <!-- 添加参数 -->
      <el-form :model="addForm" :rules="addFormRules"
      ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleTxt" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleTxt"
      :visible.sync="editDialogVisible"
      width="50%">
      <!-- 修改参数 -->
      <el-form :model="editForm" :rules="addFormRules"
      ref="editFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleTxt" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活页签的名称
      activeName: 'many',
      // 动态参数
      manyTableData: [],
      // 静态参数
      onlyTableData: [],
      // 控制添加参数对话框的显隐
      addDialogVisible: false,
      // 参数对话框
      addForm: {
        attr_name: ''
      },
      // 修改参数对话框
      editForm: {
        attr_name: '',
        attr_id: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.cateList = res.data
    },
    // 级联选择器变化监听函数
    handleCateChange() {
      this.getParamsData()
    },
    // tab 页签点击事件处理函数
    handleTabClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }
      // 发起商品列表数据请求 根据分类Id和当前面板获取对应参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`, {
          params: { sel: this.activeName }
        })
      if (res.meta.status !== 200) {
        return this.$message.error('请求参数失败！')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 自定义添加控制标签输入文本框的显隐
        item.inputVisible = false
        // 自定义添加一个双向绑定输入值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.getParamsData()
        this.$message.success('添加参数成功！')
      })

      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // 点击按钮显示修改对话框
    showEditDialog(name, id) {
      this.editForm.attr_name = name
      this.editForm.attr_id = id
      this.editDialogVisible = true
    },
    // 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败！')
        }
        this.$message.success('修改成功！')
        this.getParamsData()
      })
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = false
    },
    // 点击弹窗确认是否删除
    async removeParams(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.getParamsData()
      this.$message.success('删除成功！')
    },
    // 标签文本框失去焦点或者enter后的处理时间函数
    async handleInputConfirm(scopeRow) {
      // 排除空格
      if (scopeRow.inputValue.trim().length === 0) {
        scopeRow.inputValue = ''
        scopeRow.inputVisible = false
        return false
      }
      scopeRow.attr_vals.push(scopeRow.inputValue.trim())
      scopeRow.inputValue = ''
      scopeRow.inputVisible = false

      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${scopeRow.attr_id}`, {
        attr_name: scopeRow.attr_name,
        attr_sel: scopeRow.attr_sel,
        attr_vals: scopeRow.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('添加标签失败！')
      }
      this.$message.success('添加标签成功！')
      this.getCateList()
    },
    showInput(scopeRow) {
      scopeRow.inputVisible = true
      // 让input自动获得焦点
      // $nextTick的作用：当页面上的元素被重新渲染后，才会执行回调函数中的代码
      this.$nextTick(_ => {
        // 由于页面开始没有input，因此需要$nextTick，等待页面input出现后执行以下代码
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    async handleClose(scopeRow, i) {
      scopeRow.attr_vals.splice(i, i + 1)
      // 删除标签后将数据库数据更新并重新渲染页面
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${scopeRow.attr_id}`, {
        attr_name: scopeRow.attr_name,
        attr_sel: scopeRow.attr_sel,
        attr_vals: scopeRow.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除标签失败！')
      }
      this.$message.success('删除标签成功！')
      this.getCateList()
    }
  },
  computed: {
    // 如果按钮需要被禁用，返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 由于分类层级id刚好与该分类长度相同，所以根据分类数组长度确定id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return false
    },
    titleTxt() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态参数'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat-opt{
  margin: 15px 0;
}
.el-tag{
  margin: 5px;
}
.input-new-tag{
  width: 120px;
}
</style>
