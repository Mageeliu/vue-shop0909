<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部提示区 -->
      <el-alert :closable="false" show-icon center
        title="添加商品信息" type="info">
      </el-alert>
      <!-- 步骤条区 -->
      <el-steps :active="active - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab侧边栏 -->
      <el-form :model="addGoodsForm" :rules="addGoodsRules" ref="addGoodsRef" label-width="100px" labelPosition="top">
        <el-tabs v-model="active" @tab-click="tabClick" :before-leave="changeTab" tab-position="left">
          <el-tab-pane label="商品名称" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                :options="cateList"
                :checkStrictly= 'false'
                :props="{
                  expandTrigger: 'hover',
                  label: 'cat_name',
                  value: 'cat_id',
                  children: 'children'
                }"
                v-model="addGoodsForm.goods_cat"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTabData" :label="item.attr_name" :key="item.attr_id">
              <el-checkbox-group  v-model="item.attr_vals">
                <el-checkbox v-for="(tag, i) in item.attr_vals" :label="tag" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTabData" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片上传到的后台api地址 -->
            <!-- 由于上传图片未调用axios，所以需要手动添加Authorization -->
            <el-upload
              :action="uploadURL" :headers="headersObj" :on-preview="handlePreview"
              :on-remove="handleRemove" :on-success="handleSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button class="addBtn" type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览弹框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="preDialogVisible"
      width="50%">
      <el-image :src="picsUrl">
        <div slot="placeholder" class="image-slot">
          加载中<span class="dot">...</span>
        </div>
      </el-image>
    </el-dialog>
  </div>
</template>

<script>
// 官方提倡以_接收lodash
import _ from 'lodash'
export default {
  data() {
    return {
      active: '0',
      // 添加商品表单
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的参数（数组）
        attrs: [],
        goods_introduce: ''
      },
      // 添加商品验证规则
      addGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类参数列表
      cateList: [],
      // 动态参数列表
      manyTabData: [],
      // 静态属性列表
      onlyTabData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览弹框控制
      preDialogVisible: false,
      picsUrl: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    handleChange() {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    // 监听侧边栏切换，并根据切换信息限定切换条件
    changeTab(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请添加商品信息')
        return false
      }
    },
    // 根据切换返回信息，请求对应数据
    async tabClick() {
      if (this.active === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length > 0 ? item.attr_vals.split(',') : []
        })
        this.manyTabData = res.data
        console.log(res.data)
      } else if (this.active === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        this.onlyTabData = res.data
        console.log(res.data)
      }
    },
    // 图片预览处理函数
    handlePreview(file) {
      console.log(file)
      this.picsUrl = file.response.data.url
      this.preDialogVisible = true
    },
    // 图片移除函数
    handleRemove(file) {
      // console.log(file)
      // 1、获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2、找到欲删除图片在数组中的索引值
      const i = this.addGoodsForm.pics.findIndex(x => x.pic === filePath)
      // 3、根据索引值删除图片对象
      this.addGoodsForm.pics.splice(i, 1)
    },
    handleSuccess(response) {
      // 1、拼接得到图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2、将图片信息对象push到pics数组里面
      this.addGoodsForm.pics.push(picInfo)
      // console.log(response)
    },
    add() {
      this.$refs.addGoodsRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写表单的必要项内容')
        }
        // lodash深拷贝，避免页面渲染所需goods_cat数组形式与接口字符冲突
        const form = _.cloneDeep(this.addGoodsForm)
        form.goods_cat = form.goods_cat.join(',')
        // 导入动态参数
        this.manyTabData.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          form.attrs.push(obj)
        })
        // 导入静态参数
        this.onlyTabData.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          form.attrs.push(obj)
        })
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('创建商品失败！')
        }
        this.$message.success('创建商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 5px !important;
}
.addBtn{
  margin: 15px 0;
}
</style>
