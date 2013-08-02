<?php
    include('template/index.php');
    get_header('login');
?>
<div class="body3">
    <div class="main">
        <article id="content">
            <div class="wrapper">
                <section class="col">
                    <h2 class="under">Efetuar Login</h2>
                        <form id="formulario" method="post">
                        <div>
                            <div  class="wrapper">
                            <p id="msg_erro" visibility="hidden">Email ou password errados</p>
                                <span>Email:</span>
                                <input id="email" name="email" required type="text" class="input" >
                            </div>
                            <div  class="wrapper">
                                <span>Password:</span>
                                <input id="password" name="password" required type="password" class="input" >
                            </div>
                            <a id="btn_login" type="button" >Login</a>
                        </div>
                    </form>
                    <h1>Não tem uma conta? <a href="registo.php">Inscreva-se agora</a></h1>
                </section>
            </div>
        </article>
    </div>
</div>
<?php
    get_footer();
?>
