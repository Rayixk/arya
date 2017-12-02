/**
 * Created by Administrator on 2017/10/11.
 */


(function (jq) {


    
    var requestUrl = "";
    var GLOBAL_CHOICES_DICT = {
        // 'status_choices': [[0,'xxx'],]
        // 'xxxx_choices': [[0,'xxx'],]
    };

    function  getChoiceNameById(choice_name,id) {
        var val;

        var status_choices_list = GLOBAL_CHOICES_DICT[choice_name];
        $.each(status_choices_list,function (kkkk,vvvv) {
              if(id == vvvv[0]){
                  val = vvvv[1];
              }
        });
        return val;
    }


    String.prototype.format = function (args) {
        return this.replace(/\{(\w+)\}/g, function (s, i) {
            return args[i];
        });
    };

    /*
    像后台获取数据
     */
    function init(pageNum) {
        $('#loading').removeClass('hide');

        $.ajax({
            url:requestUrl,
            type: 'GET',
            data: {'pageNum':pageNum},
            dataType: 'JSON',
            success:function (response) {
                /* 处理choice */
                GLOBAL_CHOICES_DICT = response.global_choices_dict;

                /* 处理表头 */
                initTableHead(response.table_config);

                /* 处理表内容 */
                initTableBody(response.data_list,response.table_config);

                /* 处理表分页 */
                initPageHtml(response.page_html);


                $('#loading').addClass('hide');
            },
            error:function () {
                $('#loading').addClass('hide');
            }
        })


    }

    function initPageHtml(page_html) {
        $('#pagination').empty().append(page_html);
    }
    
    function initTableHead(table_config) {
        /*
         table_config = [
                {
                    'q': 'hostname',
                    'title': '主机名',
                },
                {
                    'q': 'sn',
                    'title': '序列号',
                },
                {
                    'q': 'os_platform',
                    'title': '系统',
                },
            ]
         */
        $('#tHead tr').empty();
            $.each(table_config,function (k,conf) {
                if(conf.display){
                    var th = document.createElement('th');
                    th.innerHTML = conf.title;
                    $('#tHead tr').append(th);
                }
            });
    }

    function initTableBody(data_list,table_config) {
        /*
        [
            {'hostname':'xx', 'sn':'xx', 'os_platform':'xxx'},
            {'hostname':'xx', 'sn':'xx', 'os_platform':'xxx'},
            {'hostname':'xx', 'sn':'xx', 'os_platform':'xxx'},
            {'hostname':'xx', 'sn':'xx', 'os_platform':'xxx'},
            {'hostname':'xx', 'sn':'xx', 'os_platform':'xxx'},
        ]

        <tr>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
        </tr>

         */
        $('#tBody').empty();

        $.each(data_list,function (k,row_dict) {
            // 循环数据库中获取到的每行数据
            // row_dict = {'hostname':'xx', 'sn':'xx', 'os_platform':'xxx'},

            var tr = document.createElement('tr');

            $.each(table_config,function (kk,vv) {
                if(vv.display){
                    var td = document.createElement('td');


                    /* 处理Td内容 */
                    var format_dict = {};
                    $.each(vv.text.kwargs,function (kkk,vvv) {
                        if(vvv.substring(0,2) == "@@"){
                            var name = vvv.substring(2,vvv.length); // status_choices
                            var val = getChoiceNameById(name,row_dict[vv.q]);
                            format_dict[kkk] = val;
                        }
                        else if(vvv[0] == "@"){
                            var name = vvv.substring(1,vvv.length);
                            format_dict[kkk] = row_dict[name];
                        }else{
                            format_dict[kkk] = vvv;
                        }
                    });

                    td.innerHTML = vv.text.tpl.format(format_dict);

                    /* 处理Td属性 */
                    $.each(vv.attr,function(attrName,attrVal){
                        if(attrVal[0] == "@"){
                            attrVal = row_dict[attrVal.substring(1,attrVal.length)]
                        }
                       td.setAttribute(attrName,attrVal);
                    });


                    $(tr).append(td);
                }
            });

            $('#tBody').append(tr);
        })

    }

    jq.extend({
        "nBList":function (url) {
            requestUrl = url;
            init(1);
        },
        "changePage":function (pageNum) {
            init(pageNum);
        }
    });

})(jQuery);




