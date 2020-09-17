<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/" class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table :data="cateList" :columns="columns"
      :selection-type="false" :expand-type="false"
      show-index index-text="#" border
      :show-row-hover="false" class="treeTable">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen"
          v-if="scope.row.cat_deleted == false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 排序 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="sizes, prev, pager, next"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%">
      <!-- 树形控件 -->
      <el-form :model="addCateForm" :rules="addCateRules"
      ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader v-model="selectedKeys"
          :options="parentCateList" clearable
          :props="{
            expandTrigger: 'hover',
            ...casecaderProps,
            checkStrictly: true
          }"
          @change="parentCateChange">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      total: 0,
      // tree-table的定义列
      columns: [{
        label: '分类名称',
        prop: 'cat_name',
        width: '300'
      },
      {
        label: '是否有效',
        // 自定义模板列
        type: 'template',
        // 自定义模板名称
        template: 'isok'
      },
      {
        label: '排序',
        type: 'template',
        template: 'order'
      },
      {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 父级分类id
        cat_pid: 0,
        cat_name: '',
        // 默认分类等级是一级分类
        cat_level: 0
      },
      // 添加分类表单验证规则对象
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表数据
      parentCateList: [],
      // 指定联级的配置对象
      casecaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的数组
      selectedKeys: []

    }
  },
  created() {
    // 获取商品分类列表数据
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 添加分类显示对话框
    showAddCateDialog() {
      // 先获取父级分类列表数据
      this.getParentCateList()
      // 在展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级的分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.parentCateList = res.data
    },
    parentCateChange() {
      // 如果selectedKeys的length>0，证明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return false
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击添加分类
    addCate() {
      console.log(this.selectedKeys, this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
      })
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.addCateDialogVisible = false
    }

  }
}
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}

</style>
