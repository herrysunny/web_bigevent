$(function () {
    var layer = layui.layer
    var from = layui.form()
    var laypage = layui.laypage
    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)

        var y = dt.getFullYear()
        var m = padZero(dt.getMonth())
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getHours())

        return y + '-' + m + ' ' + d + ' ' + hh + ':' + mm + ':' + ss
    }
    // 定义补0的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }
    // 定义一个查询的参数对象，奖励请求数据的对象
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1,
        pagesize: 2,
        cate_id: '',
        state: ''
    }
    initTable()

    initCate()


    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                // 使用模板引擎渲染页面数据
                var htmlStr = template('tpl-table', res)
                $('body').html(htmlStr)
                // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id').html(htmlStr)
                // 通知layui重新渲染表达区域的ui结构
                form.render()
            }
        })
    }

    // 为帅选表单绑定submit事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id').val()
        var state = $('[name-state]').val()
        // 为查询参数对象q中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
        // 根据最新的帅选条件重新渲染表格数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        laypage.render({
            elem: 'pageBox', //分页容器的id
            count: total,    //数据总数，从服务端得到
            limit: q.pagesize,//每页显示几条数据
            curr: q.pagenum,  //设置默认被选中的分页，第1页
            layout:['count','limit','prev','page','next','skip'],
            limits:[2,3,5,10],
            // 分页发生切换时候触发Jump回调
            // 触发jump回调的方式有两种：
            // 1.点击页码的时候
            // 2.调用了laypage.render就会触发jump回调
            jump: function (obj,first) {
                // 可以通过first的值，来判断是通过哪种方式，触发的Jump回调
                //obj包含了当前分页的所有参数，比如：
                console.log(first); //得到当前页，以便向服务端请求对应页的数据。
                console.log(obj.curr)
                q.pagenum = obj.curr 
                q.pagesize=obj.limit
                // initTable()
                if(!first){
                    initTable()
                }   
            }
            
        })
    }

    // 通过代理的形式为删除按钮绑定点击时间处理函数
    $('tbody').on('click','.btn-delete',function(){
        // 获取删除按钮的个数
        var len=$('.btn-delete').length
        var id=$(this).attr('data-id')
        layer.confirm('确认删除?', {icon: 3, title:'提示'}, function(index){
            //do something
            $.ajax({
                method:'GET',
                url:'/my/article/delete/'+id,
                success:function(res){
                    if(res.status!==0){
                        return layer.msg('删除文章失败!')
                    }
                    return layer.msg('删除文章成功！')
                    // 当数据删除成功后，需要判断当前这一页中，是否还有剩余的数据

                    // 如果没有剩余的数据了，则让页码值-1之后，再重新调用inittable
                    if(len===1){
                        // 如果len的值等于1，证明删除完毕之后页面上没有数据了
                        // 页码值最小必须是1
                        q.pagenum=q.pagenum===1?1:q.pagenum-1
                    }
                    initTable()
                }
            })
            layer.close(index);
          });
        console.log()
    })

})