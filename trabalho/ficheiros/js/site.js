(function ()
    {
        var xmlDoc;
        var map;

        function addEvent(obj, eventName, handler) 
        {
            /*Adiciona um event listener ao objecto independentemente do browser.*/
            if (obj.addEventListener) {
                obj.addEventListener(eventName, handler);
            } else {
                obj.attachEvent('on' + eventName, handler);
            }
        }

        addEvent(window, 'load', init);

        function init()
        {
            /*
            Função onde são chamadas todas os metodos que tem que ser carregados quando a pagina terminar de load*/
            converterDisciplinasXMLParaJSON();
            addEvent(document.getElementById('botaoProcurarDisciplina'), 'click', procurarDisciplina);
            (function()  {
                    var mapOptions = 
                    {
                        zoom: 8,
                        center: new google.maps.LatLng(41.007191, -8.641033),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    map = new google.maps.Map(document.getElementById("map_canvas"),
                        mapOptions);
            })();
            carregarLS();
        }

        function construirTabela(lista)
        {
            /*Constroi a tabela com os resultados da pesquisa*/
            document.getElementById('conteudoTabela').innerHTML="<table id='info' class='table'></table>";
            var thead, linha, conteudo, dre, totalCienciasTecnologias, totalArtesVisuais, totalCienciasSociaisHumanas, corpo, hash;

            thead=document.createElement('THEAD');
            linha=document.createElement('TR');
            thead.appendChild(linha);

            conteudo=document.createElement('TH');
            conteudo.textContent='Direcção Geral ensino';
            linha.appendChild(conteudo);

            conteudo=document.createElement('TH');
            conteudo.textContent='Concelho';
            linha.appendChild(conteudo);

            conteudo=document.createElement('TH');
            conteudo.textContent='Total alunos curso Ciencias sociais e humanas';
            linha.appendChild(conteudo);

            conteudo=document.createElement('TH');
            conteudo.textContent='Total alunos curso Ciencias e Tecnologias';
            linha.appendChild(conteudo);

            conteudo=document.createElement('TH');
            conteudo.textContent='Total alunos Artes visuais';
            linha.appendChild(conteudo);

            document.getElementById('info').appendChild(thead);

            corpo=document.createElement('TBODY');

            for(i=0, end=lista.length; i<end; ++i)
            {
                (function(a)
                    {
                        dre=lista[a].DRE;
                        concelho=lista[a].CONCELHO;
                        totalCienciasSociaisHumanas=lista[a].cienciassociaisehumanas;
                        totalCienciasTecnologias=lista[a].cienciasetecnologias;
                        totalArtesVisuais=lista[a].artesvisuais;
                        hash=lista[a].hash;

                        linha=document.createElement('TR');
                        addEvent(linha, 'click', (function (temp){getLocais(temp)})(hash));
                        corpo.appendChild(linha);

                        conteudo=document.createElement('TD');
                        conteudo.textContent=dre;
                        linha.appendChild(conteudo);

                        conteudo=document.createElement('TD');
                        conteudo.textContent=concelho;
                        linha.appendChild(conteudo);

                        conteudo=document.createElement('TD');
                        conteudo.textContent=totalCienciasSociaisHumanas;
                        linha.appendChild(conteudo);

                        conteudo=document.createElement('TD');
                        conteudo.textContent=totalCienciasTecnologias;
                        linha.appendChild(conteudo);

                        conteudo=document.createElement('TD');
                        conteudo.textContent=totalArtesVisuais;
                        linha.appendChild(conteudo);
                })(i)
            }
            document.getElementById('info').appendChild(corpo);
            $("#info").tablesorter(); 
        }

        function adicionarPins(casas)
        {
            /*Adiciona as localizações de cada casa disponivel ao mapa*/
            var lista=[];
            lista=JSON.parse(casas);
            for (var i = 0; i < lista.length; i++) 
            {
                (function(a)
                    {
                        var marcador = new google.maps.Marker(
                            {
                                position: new google.maps.LatLng(lista[a].lat, lista[a].lng), 
                                map: map,        
                        });
                        google.maps.event.addListener(marcador, 'click', function() 
                            {  
                                janela.open(map, marcador);  
                        });
                        var janela = new google.maps.InfoWindow(
                            {  
                                content:  ('<div class="infowindow"><strong>'+ lista[a].title +'</strong>', '</strong><br />'+lista[a].id+'</div>')
                        }); 
                })(i)
            }
        }

        function procurarDisciplina()
        {
            /*Carrega a base de dados, e procura a pesquisa do utilizador nesta*/
            gravarLS();
            var xhrD;
            if(window.XMLHttpRequest)
                {
                xhrD=new XMLHttpRequest();
            }
            else
                {
                xhrD=new ActiveXObject('Microsoft.XMLHTTP');
            }

            xhrD.onreadystatechange = function () 
            { 
                if (xhrD.readyState === 4 && xhrD.status === 200) 
                    {
                    var pesquisaCliente=document.getElementById('pesquisaDisciplina').value;
                    var cursos=getCursosDisciplina(pesquisaCliente);
                    var items=JSON.parse(xhrD.responseText);
                    var i, end, resultado;
                    resultado=[];
                    for(i=0, end=items.length; i<end; ++i)
                    {
                        if(items[i][cursos[0]]>0 || items[i][cursos[1]]>0 || items[i][cursos[2]]>0)
                            {
                            resultado.push(items[i]);
                        }
                    }
                    construirTabela(resultado);
                }
            };

            xhrD.open('GET', 'ficheiros/json/inscritoscursonacional.json');
            xhrD.send(null);
        }

        function getCursosDisciplina(texto)
        {
            /*Carrega todos os cursos onde é lecionada a disciplina a pesquisar*/
            var i, end, items, disciplinasTemp, dEnd, d, curso;
            curso=[];
            items = xmlDoc.documentElement.getElementsByTagName('curso');
            for (i = 0, end = items.length; i < end; ++i) 
            {
                disciplinasTemp=items[i].getElementsByTagName('disciplina');
                for(d=0, dEnd=disciplinasTemp.length; d<dEnd; ++d)
                {
                    if(disciplinasTemp[d].textContent.trim()===texto)
                        {
                        curso.push(((items[i].getElementsByTagName('nome')[0].textContent).toLowerCase()).replace(/\s/g,''));
                        break;
                    }
                }
            }
            return curso;
        }

        function contemDisciplinas(lista, disciplina)
        {
            /*Verifica se a lista resultante da procura já contem a disciplina, para evitar disciplinas repetidas no input */
            var i, iEnd;
            for (var i = 0, iEnd=lista.length; i < iEnd; ++i) 
            {
                if (lista[i]===disciplina) 
                    {
                    return true;
                }
            }
            return false;
        }

        function getLocais(chave)
        {
            /*Este metodo vai a um ficheiro php existente no servidor para este depois ir ao site da ERA buscar todos os imoveis disponiveis de acordo com a pesquisa do utilizador, contornando assim o SAME ORIGIN POLICY*/
            var xhrL;
            var endereco='cordenadas.php?chave='+chave;
            if(window.XMLHttpRequest)
                {
                xhrL=new XMLHttpRequest();
            }
            else
                {
                xhrL=new ActiveXObject('Microsoft.XMLHTTP');
            }


            xhrL.onreadystatechange = function () 
            { 
                if (xhrL.readyState === 4 && xhrL.status === 200) 
                    {
                    var items=xhrL.responseText;
                    items;
                    var i, end, resultado;
                    adicionarPins(items);
                }
            }
            xhrL.open('GET', endereco);
            xhrL.send(null);
        }

        function gravarLS() 
        {
            /*Grava no Local Storage a pesquisa do utilizador, para que quando este tenha internet não tenha que a realizar outra vez e seja logo apresentado os resultados*/
            localStorage.setItem('ultimaPesquisa', document.getElementById('pesquisaDisciplina').value);
        }

        function carregarLS() 
        {
            /*Carrega a pesquisa previamente guardada no Local storage*/
            if (localStorage.getItem('ultimaPesquisa') !== null) 
                {
                document.getElementById('pesquisaDisciplina').value=localStorage.getItem('ultimaPesquisa');
                procurarDisciplina();
            }
        }

        function converterDisciplinasXMLParaJSON()
        {
            /*Converte as disciplinas existentes no ficheiro xml para JSON*/
            var xhr;
            if(window.XMLHttpRequest)
                {
                xhr=new XMLHttpRequest();
            }
            else
                {
                xhr=new ActiveXObject('Microsoft.XMLHTTP');
            }


            xhr.onreadystatechange = function()
            {
                if (xhr.readyState === 4 && xhr.status === 200) 
                    {
                    var i, end, items, disciplinas, d, dEnd, disciplinasTemp;
                    items=[];
                    disciplinas=[];
                    xmlDoc = xhr.responseXML;
                    items = xmlDoc.documentElement.getElementsByTagName('curso');
                    for (i = 0, end = items.length; i < end; ++i) 
                    {
                        disciplinasTemp=items[i].getElementsByTagName('disciplina');
                        for(d=0, dEnd=disciplinasTemp.length; d<dEnd; ++d)
                        {
                            if(String.trim)
                                {
                                if(contemDisciplinas(disciplinas, disciplinasTemp[d].textContent.trim())==false)
                                    {
                                    disciplinas.push(disciplinasTemp[d].textContent.trim());
                                }
                            }
                            else
                                {
                                if(contemDisciplinas(disciplinas, $.trim(disciplinasTemp[d].textContent))==false)
                                    {
                                    disciplinas.push($.trim(disciplinasTemp[d].textContent));
                                }
                            }
                        }
                    }
                    //arranjar para o ie8
                    document.getElementById('pesquisaDisciplina').dataset.source=(JSON.stringify(disciplinas));
                }
            }
            xhr.open('GET', 'ficheiros/xml/cursos.xml');
            xhr.send(null);
        }
})();