INSERT INTO tb_user (name, email, password) VALUES ('Fabio', 'fabio@gmail.com', '123456');
INSERT INTO tb_user (name, email, password) VALUES ('Rodrigo', 'rodrigo@gmail.com', '123456');

INSERT INTO tb_role (authority) VALUES ('ROLE_OPERATOR');
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN');

INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1);
INSERT INTO tb_user_role (user_id, role_id) VALUES (2, 1);
INSERT INTO tb_user_role (user_id, role_id) VALUES (2, 2);
