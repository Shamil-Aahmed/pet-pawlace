USE pawlace1;
SET foreign_key_checks = 0;
drop table if exists users,breed,category,pets,orders;
create table users (
	id int PRIMARY KEY AUTO_INCREMENT,
    email varchar(35) UNIQUE Not null,
    name varchar(30) NOT NULL,
    password varchar(100) NOT NULL,
    is_admin BOOLEAN default(0),
    is_verified BOOLEAN default(0)
)ENGINE = InnoDB;


create table category (
	id int PRIMARY KEY auto_increment,
    name varchar(30) unique not null
)ENGINE = InnoDB;


create table breed (
	id int primary key auto_increment,
    name varchar(30) unique not null,
    category_id int NOT NULL,
    FOREIGN KEY (category_id) references category (id) On delete cascade
    
)ENGINE = InnoDB;

create table pets(
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    breed_id  INT NOT NULL,
    price  FLOAT NOT NULL ,
    age varchar(2) NOT NULL ,
    status varchar(20) default("available"),
    image_id varchar(200),
	pet_description varchar(333) not null,
    image_link varchar(200),
    FOREIGN KEY (breed_id) references breed (id)  On delete cascade
)ENGINE = InnoDB;
create table orders(
	id int primary key auto_increment,
    address varchar(40) not null ,
    user_id int not null,
    pet_id int not null,
    order_date timestamp default current_timestamp,
    transaction_id varchar(20) default(null),
    phone_no varchar(15) Not null,
    city varchar(21) Not null,
    country varchar(21) Not null,
    FOREIGN KEY (user_id) references users (id) On delete cascade,
    FOREIGN KEY (pet_id) references pets (id)  On delete cascade,
    status varchar(10) not null default("unverified")
)ENGINE = InnoDB;

insert into category (name) values ("Dog");
insert into category (name) values ("Cat");
insert into category (name) values ("Horse");
insert into category (name) values ("Lion");

insert into breed (category_id,name) values ((select id from category where name = "Dog"),"bulldog");
insert into breed (category_id,name) values ((select id from category where name = "Cat"),"irish");
insert into breed (category_id,name) values ((select id from category where name = "Horse"),"hoi");



update users set is_admin = 1 where email ="admin456@admin.com";
update users set is_verified = 1 where email ="admin456@admin.com";

SET foreign_key_checks = 1;
