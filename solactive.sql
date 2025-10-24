create database solactive_price_validation;
use solactive_price_validation;

create table activo(
	idActivo int auto_increment primary key,
    precioActivo float,
    timestampRecepcion timestamp,
    divisaActivo varchar(5) not null,
    tickerUniversal varchar(10) not null,
    regionActivo varchar(25) not null,
    claseActivo varchar(50) not null
);

create table vendor(
	idVendor int not null auto_increment primary key,
    nombreVendor varchar(50) not null,
    emailSoporte varchar(255) not null,
    importanciaVendor int not null
);

create table detalleRecepcion(
	idRecepcion int not null auto_increment primary key,
    idVendorFK int not null,
    idActivoFK int not null,
    foreign key (idVendorFK) references vendor(idVendor),
    foreign key (idActivoFK) references activo(idActivo)
);

create table resultado(
	idActivoFK int not null unique,
	idResultado int auto_increment primary key,
    observacionResultado varchar(255),
    foreign key (idActivoFK) references activo(idActivo)
);

select * from activo;

create table division(
	idDivision int auto_increment primary key,
    nombreDivision varchar(25) not null
);

create table usuario(
	idUsuario int auto_increment primary key,
    idDivisionFK int not null,
	nombreUsuario varchar(50) not null,
    emailCorporativo varchar(100) not null,
    contraseñaUsuario varchar(25) not null,
    idResultadoFK int not null,
    foreign key (idDivisionFK) references division(idDivision),
    foreign key (idResultadoFK) references resultado(idResultado)
);

/*Insert de activos*/
describe activo;
/* Insert XKUW */
insert into activo values ("", 0.337, "2025-08-14 10:00:02.3197", "KWD", "XKUW", "ASIA", "SHARE");
insert into activo values ("", 0.337, "2025-08-14 22:15:46.859085", "KWD", "XKUW", "ASIA", "SHARE"), ("", 0.337, "2025-08-15 22:04:34.880061", "KWD", "XKUW", "ASIA", "SHARE");

/* Insert XAMS */

insert into activo values ("", 0.9318, "2025-01-06 17:00:01.219813", "EUR", "XAMS", "EUROPE", "SHARE"), ("", 0.9318, "2025-01-06 23:15:55.605843", "EUR", "XAMS", "EUROPE", "SHARE"), ("", 0.9309, "2025-01-08 23:01:57.681922", "EUR", "XAMS", "EUROPE", "SHARE");

/* Insert XSGO */

insert into activo values ("", 3140, "2025-06-17 20:02:07.214827", "CLP", "XSGO", "AMERICA", "SHARE"),("", 3140, "2025-06-19 22:01:48.787615", "CLP", "XSGO", "AMERICA", "SHARE"),("", 3140, "2025-06-17 22:15:45.956838", "CLP", "XSGO", "AMERICA", "SHARE");

/*Insert de vendor y detalleRecepcion*/
describe detalleRecepcion;
insert into vendor values ("","ICE","iceacciones@theice.com", 1),("","FactSet","support@factset.com",2),("","EDI","rrhh@edicomgroup.com",3);
insert into detalleRecepcion values ("",1,1), ("",2,2), ("",3,3), ("",1,4), ("",2,5), ("",3,6), ("",1,7), ("",2,8), ("",3,9);

/*Insert de division*/

insert into division values (" ", "equity core"), (" ", "price data");

/*Insert de Resultado*/
insert into resultado values (1,"",""),(4,"",""),(7,"","");

alter table resultado add tickerResultado varchar(15);
update resultado set tickerResultado = "XKUW" where idResultado = 1;
update resultado set tickerResultado = "XAMS" where idResultado = 2;
update resultado set tickerResultado = "XSGO" where idResultado = 3;
alter table resultado add estadoValidacion varchar(20);
update resultado set estadoValidacion = "Validated" where idResultado = 1;
update resultado set estadoValidacion = "Semi-Validated" where idResultado = 2;
update resultado set estadoValidacion = "Validated" where idResultado = 3;
describe resultado;
select * from resultado;
/*No insert pero no se como almacenarlo*/
/*select
    r.idResultado,
    a.tickerUniversal,
    a.precioActivo,
    case
        WHEN COUNT(DISTINCT a.precioActivo) = 3 AND COUNT(a.tickerUniversal) = 3 THEN 'Unvalidated'
        WHEN COUNT(DISTINCT a.precioActivo) = 2 AND COUNT(a.tickerUniversal) = 3 THEN 'Semi-Validated'
        ELSE 'Validated'
    END AS estado
FROM resultado r
JOIN activo a ON r.tickerResultado = a.tickerUniversal;
*/
 
/*Insert de usuario*/

insert into usuario (idUsuario, idDivisionFK, nombreUsuario, emailCorporativo, contraseñaUsuario, idResultadoFK) values (null, 1, "sara pastrosa", "sarap@solactiveequity.com", "sa.solequitycore2",1), (null, 2, "aitor tilla", "a.tilla@solactiveprice.data.com", "a.tpricesol_",1), (null, 1, "armando bulla", "ar_bu@solactiveequity.com", "armandoequity",2), (null, 2, "ines esario", "ines.es@solactiveprice.data.com", "inesolactivep",2), (null, 1, "alan brito", "alan_b@solactiveequity.com", "alanbr.equity",3), (null, 2, "elba calao", "elbaca@solactiveprice.data.com", "elbitacapricedata*",3);
create view vistaResultados as select r.tickerResultado as "Ticker de validacion", r.estadoValidacion as "Estado de la validacion" from resultado r;
select * from vistaResultados;
describe resultado;

select * from usuario;

/*Insert de activos (tabla principal)*/
describe activo;
/*Insert XCSE*/
insert into activo values
(null, 116, "2025-03-14 16:20:01.296614", "DKK", "XCSE", "EUROPE", "SHARE"),
(null, 116, "2025-03-14 22:45:45.932365", "DKK", "XCSE", "EUROPE", "SHARE"),
(null, 116, "2025-03-16 23:01:52.013627", "DKK", "XCSE", "EUROPE", "SHARE");

/*Insert XAMS*/
insert into activo values 
(null, 97.72, "", "EUR", "XAMS", "EUROPE", "SHARE"),
(null, 97.72, "2024-12-31 23:15:45.918262", "EUR", "XAMS", "EUROPE", "SHARE"),
(null, 97.72, "2025-01-02 23:01:47.036302", "EUR", "XAMS", "EUROPE", "SHARE");

select * from activo where tickerUniversal like "XAMS";

/*Modify*/
alter table activo add column fechaNeg date;
/* XKUW */
update activo set fechaNeg = "2025-08-14" where idActivo in (1,2,3);
/* XAMS 1 */
update activo set fechaNeg = "2025-01-06" where idActivo in (4,5,6);

/* XSGO */

update activo set fechaNeg = "2025-06-17" where idActivo in (7,8,9);

/* XCSE */

update activo set fechaNeg = "2025-03-14" where idActivo in (10,11,12);

/* XAMS 2 */

update activo set fechaNeg = "2025-12-31" where idActivo in (13,14,15);

select * from activo;

/*Cierre Modify*/

/* Insert XSTC */

describe activo;

insert into activo values 
(null, 18650, "2025-02-07 12:59:02.149535", "VND", "XSTC", "ASIA", "SHARE", "2025-02-07"),
(null, 18650, "2025-02-07 22:45:46.149929", "VND", "XSTC", "ASIA", "SHARE", "2025-02-07"),
(null, 18650, "2025-02-09 23:02:04.882739", "VND", "XSTC", "ASIA", "SHARE", "2025-02-07");

/* Insert XMAD */

insert into activo values
(null, 25.53, "2025-07-24 15:35:09.539820", "PLN", "XMAD", "EUROPE", "SHARE", "2025-07-24"),
(null, 25.53, "2025-07-24 22:15:45.096203", "PLN", "XMAD", "EUROPE", "SHARE", "2025-07-24"),
(null, 25.53, "2025-07-25 22:04:33.693556", "PLN", "XMAD", "EUROPE", "SHARE", "2025-07-24");

update activo set divisaActivo = "EUR" where idActivo in (19,20,21);

/* Insert XWAR */

insert into activo values 
(null, 28.5, "2025-06-06 15:55:43.578037", "PLN", "XWAR", "EUROPE", "SHARE", "2025-06-06"),
(null, 28.5, "2025-06-06 21:45:45.517875", "PLN", "XWAR", "EUROPE", "SHARE", "2025-06-06"),
(null, 28.5, "2025-06-08 22:01:47.020138", "PLN", "XWAR", "EUROPE", "SHARE", "2025-06-06");

/* Insert XHEL */

insert into activo values
(null, 14.34, "2025-08-22 16:00:01.353369", "EUR", "XHEL", "EUROPE", "SHARE", "2025-08-22"),
(null, 14.34, "2025-08-22 21:45:46.721264", "EUR", "XHEL", "EUROPE", "SHARE", "2025-08-22");

/* Insert XPHS */

insert into activo values
(null, 2.41, "2025-06-05 06:50:01.250146", "PHP", "XPHS", "ASIA", "SHARE", "2025-06-05"),
(null, 2.41, "2025-06-05 22:16:02.483265", "PHP", "XPHS", "ASIA", "SHARE", "2025-06-05"),
(null, 2.41, "2025-06-06 22:04:26.664421", "PHP", "XPHS", "ASIA", "SHARE", "2025-06-05");

/* Insert XBRU */

insert into activo values
(null, 31.3, "2025-07-28 16:00:01.157455", "EUR", "XBRU", "EUROPE", "SHARE", "2025-07-28"),
(null, 31.3, "2025-07-28 22:15:46.624183", "EUR", "XBRU", "EUROPE", "SHARE", "2025-07-28"),
(null, 31.3, "2025-07-30 22:01:54.441138", "EUR", "XBRU", "EUROPE", "SHARE", "2025-07-28");

/* Insert XHEL */
insert into activo values
(null, 0.62, "2025-07-02 16:00:01.767955", "EUR", "XHEL", "EUROPE", "SHARE", "2025-07-02"),
(null, 0.62, "2025-07-02 22:15:46.046554", "EUR", "XHEL", "EUROPE", "SHARE", "2025-07-02"),
(null, 0.62, "2025-07-04 22:01:46.144245", "EUR", "XHEL", "EUROPE", "SHARE", "2025-07-02");

/* Insert XPHS */
insert into activo values
(null, 162.8, "2025-05-29 06:50:02.394014", "PHP", "XPHS", "ASIA", "SHARE", "2025-05-29"),
(null, 162.8, "2025-05-29 22:15:57.251088", "PHP", "XPHS", "ASIA", "SHARE", "2025-05-29"),
(null, 162.8, "2025-05-30 22:04:25.892031", "PHP", "XPHS", "ASIA", "SHARE", "2025-05-29");

/* Insert XBRN */

insert into activo values
(null, 4.4, "2025-06-10 16:00:02.228993", "CHF", "XBRN", "EUROPE", "SHARE", "2025-06-10"),
(null, 4.4, "2025-06-10 22:15:51.564282", "CHF", "XBRN", "EUROPE", "SHARE", "2025-06-10"),
(null, 4.4, "2025-06-12 22:01:52.256433", "CHF", "XBRN", "EUROPE", "SHARE", "2025-06-10");

/* Insert XMEX */
insert into activo values
(null, 8.84, "2025-03-24 20:22:38.614698", "MXN", "XMEX", "AMERICA", "SHARE", "2025-03-24"),
(null, 8.84, "2025-03-24 23:15:46.152558", "MXN", "XMEX", "AMERICA", "SHARE", "2025-03-24"),
(null, 8.84, "2025-03-26 23:01:57.086785", "MXN", "XMEX", "AMERICA", "SHARE", "2025-03-24");

/* Insert DSMD */

insert into activo values
(null, 2.762, "2025-08-21 10:30:01.874585", "QAR", "DMSD", "ASIA", "SHARE", "2025-08-21"),
(null, 2.762, "2025-08-21 22:15:52.118154", "QAR", "DMSD", "ASIA", "SHARE", "2025-08-21"),
(null, 2.762, "2025-08-22 22:04:37.470030", "QAR", "DMSD", "ASIA", "SHARE", "2025-08-21");

/* Insert XATH */

insert into activo values 
(null, 10.12, "2025-01-17 15:25:01.389446", "EUR", "XATH", "EUROPE", "SHARE", "2025-01-17"),
(null, 10.12, "2025-01-17 22:45:45.767718", "EUR", "XATH", "EUROPE", "SHARE", "2025-01-17"),
(null, 10.12, "2025-01-19 23:01:46.911074", "EUR", "XATH", "EUROPE", "SHARE", "2025-01-17");

/* Insert detalleRecepcion */

alter table detalleRecepcion modify idVendorFK int not null default 1;

describe detalleRecepcion;
truncate table detalleRecepcion;
insert into detalleRecepcion (idRecepcion, idActivoFK) values
('', 1), ('', 2), ('', 3), ('', 4), ('', 5), ('', 6), ('', 7), ('', 8), ('', 9), ('', 10), ('', 11), ('', 12), ('', 13), ('', 14), ('', 15), ('', 16), ('', 17), ('', 18), ('', 19), ('', 20), ('', 21), ('', 22), ('', 23), ('', 24), ('', 25), ('', 26), ('', 27), ('', 28), ('', 29), ('', 30), ('', 31), ('', 32), ('', 33), ('', 34), ('', 35), ('', 36), ('', 37), ('', 38), ('', 39), ('', 40), ('', 41), ('', 42), ('', 43), ('', 44), ('', 45), ('', 46), ('', 47), ('', 48), ('', 49), ('', 50);
select * from detalleRecepcion;
update detalleRecepcion set idVendorFK = 2 where idRecepcion in (2, 5, 8, 11, 14, 17, 20, 23, 26, 28, 31, 34, 37, 40, 43, 46, 49);
update detalleRecepcion set idVendorFK = 3 where idRecepcion in (3, 6, 9, 12, 15, 18, 21, 24, 29, 32, 35, 38, 41, 44, 47, 50);

/* Insert de Resultados */
describe resultado;
select * from resultado;

/*Resultado XCSE*/
select distinct(precioActivo), count(*), tickerUniversal from activo where idActivo between 10 and 12;
insert into resultado values (10, "", "", "XCSE", "Validated");

/*Resultado XAMS*/
select distinct(precioActivo), count(*), tickerUniversal from activo where idActivo between 13 and 15;
insert into resultado values (13, "", "", "XAMS", "Validated");

/*Resultado XSTC*/
select distinct(precioActivo), count(*), tickerUniversal from activo where idActivo between 16 and 18;
insert into resultado values (16, "", "", "XSTC", "Validated");

/*Resultado XMAD*/
select distinct(precioActivo), count(*), tickerUniversal from activo where idActivo between 19 and 21;
insert into resultado values (19, "", "", "XMAD", "Validated");

/*Resultado XWAR*/
select distinct(precioActivo), count(*), tickerUniversal from activo where idActivo between 22 and 24;
insert into resultado values (22, "", "", "XWAR", "Validated");

/*Resultado XHEL*/
select distinct(precioActivo), count(*), tickerUniversal from activo where idActivo between 25 and 26;
insert into resultado values (25, "", "", "XHEL", "Semi-Validated");

/*Resultado XPHS*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 27 and 29;
insert into resultado values (27, "", "", "XPHS", "Validated");

/*Resultado XBRU*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 30 and 32;
insert into resultado values (30, "", "", "XBRU", "Validated");

/*Resultado XHEL*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 33 and 35;
insert into resultado values (33, "", "", "XHEL", "Validated");

/*Resultado XPHS*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 36 and 38;
insert into resultado values (36, "", "", "XPHS", "Validated");

/*Resultado XBRN*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 39 and 41;
insert into resultado values (39, "", "", "XBRN", "Validated");

/*Resultado XMEX*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 42 and 44;
insert into resultado values (42, "", "", "XMEX", "Validated");

/*Resultado DMSD*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 45 and 47;
insert into resultado values (45, "", "", "DMSD", "Validated");

/*Resultado XATH*/
select distinct(precioActivo), tickerUniversal from activo where idActivo between 48 and 50;
insert into resultado values (48, "", "", "XATH", "Validated");

select * from resultado;

/* RQF 11 */    
select nombreVendor as "Nombre Vendor", importanciaVendor as "Jerarquía" from vendor order by importanciaVendor asc


/* Requisito 14 */
DELIMITER $$
create procedure ComparacionPrecio(in ticker_comparacion varchar(10), in fecha_inicio date, in fecha_fin date, in fecha_consulta date)
begin
drop temporary table if exists compTemporal;
create temporary table compTemporal as
select
	a.tickerUniversal as ticker,
    a.fechaNeg as fechaNegociacion,
	max(case when d.idVendorFK = 1 then a.precioActivo end) as precioIce,
    max(case when d.idVendorFK = 2 then a.precioActivo end) as precioFactset,
    max(case when d.idVendorFK = 3 then a.precioActivo end) as precioEdi

from activo a join detalleRecepcion d on d.idActivoFK = a.idActivo 
where (ticker_comparacion is null or a.tickerUniversal = ticker_comparacion) and 
(
(fecha_inicio is null or a.fechaNeg >= fecha_inicio) and 
(fecha_fin is null or a.fechaNeg <= fecha_fin) and 
(fecha_consulta is null or a.fechaNeg = fecha_consulta)
)
group by a.tickerUniversal, a.fechaNeg; 

alter table compTemporal
	add column idTemp int auto_increment primary key,
	add column diferenciaIceFact float, 
	add column diferenciaIceEdi float, 
    add column diferenciaFactEdi float;

update compTemporal
	set 	
			diferenciaIceFact = precioIce - precioFactset, 
			diferenciaIceEdi = precioIce - precioEdi,
            diferenciaFactEdi = precioFactset - precioEdi
			where idTemp > 0;
alter table compTemporal add column estadoPrecio varchar(25);
update compTemporal
	set estadoPrecio  =
		case when diferenciaIceFact = 0 and diferenciaIceEdi = 0 and diferenciaFactEdi = 0 then  "Validated"
			
             when 	(diferenciaIceFact = 0) or
					(diferenciaIceEdi = 0) or
                    (diferenciaFactEdi = 0) then "Semi-Validated"
			else "Unvalidated"
        
        end
        
        where idTemp > 0;
	
select * from compTemporal;



end $$
DELIMITER ;
call ComparacionPrecio(null, null, null, null);
/* Requisito 15 */

DELIMITER $$

create function BusquedaId(ticker_val varchar(5), 
	fecha_val date,
	region_val varchar(25))
returns int
deterministic
begin 
declare idval int;
declare resultado_val varchar(255);
declare estado varchar(25);
	select idActivo into idval from activo where 
		(tickerUniversal = ticker_val) and
        (fechaNeg = fecha_val) and
        (regionActivo = region_val)
        limit 1;
return idval;
end $$
DELIMITER ;

DELIMITER $$
create function ComprobacionResultado(ticker_val varchar(5), 
	fecha_val date,
	region_val varchar(25))
returns varchar(255)
deterministic
begin 
declare idval int;
declare resultado_val varchar(255);
declare estado varchar(255);
	set idval = BusquedaId(ticker_val, fecha_val, region_val);
    
	select estadoValidacion into estado from resultado where idActivoFK = idval; 
		if estado is null then
			set resultado_val = "El resultado no ha sido registrado previamente";
		elseif estado like "V%" or estado like "S%" then
			set resultado_val = "El resultado ya fue validado";
		else 
			set resultado_val = "User-Validation";
	end if;
    return resultado_val;
end $$
DELIMITER ;

DELIMITER $$
create procedure ValidacionManual(in ticker_val varchar(5), in fecha_val date, in region_val varchar(25))
begin
declare estado varchar(255);
declare idval int;
set idval = BusquedaId(ticker_val, fecha_val, region_val);
set estado = ComprobacionResultado(ticker_val, fecha_val, region_val);
	if estado = "El resultado ya fue validado" then
		select estado as mensaje;
	ELSEIF estado = 'El resultado no ha sido registrado previamente' THEN
        SELECT estado AS mensaje;
    else
		update resultado set estadoValidacion = estado where idActivoFK = idval;
        select "Validación por usuario registrada";
	end if;

end $$
DELIMITER ;

call ValidacionManual('XHEL','2025-08-22','EUROPE'); 




/* Requisito 16 */

DELIMITER $$
create procedure ConteoValidaciones()
begin
	select estadoValidacion as "Estado", count(*) from resultado group by estadoValidacion;
end $$
DELIMITER ;
call ConteoValidaciones();

/* RQF 17 */

alter table resultado
add column fechaValidacion timestamp default current_timestamp after estadoValidacion;

delimiter //

create trigger guardar_resultado_validacion
after insert on activo
for each row
begin
    declare estado varchar(50);

    if new.precioActivo < 0 then
        set estado = 'Invalidado';
    elseif new.precioActivo between 0 and 1000 then
        set estado = 'Validado';
    else
        set estado = 'Semivalidado';
    end if;

    insert into resultado (idActivoFK, estadoValidacion, observacionResultado)
    values (new.idActivo, estado, 'Validación automática al recibir precio');
end;
//

delimiter ;

show triggers;

#prueba 

insert into activo 
(precioActivo, timestampRecepcion, divisaActivo, claseActivo, tickerUniversal)
values 
(500, now(), 'USD', 'SHARE', 'AAPL');

select * from resultado;


/* RQF 18 */

/* ete e con la mardita table e error */

/* RQF 19 */
/* TOCA CREAS LAS TABLA ERROR */

set @tipoError := 'PRECIO FUERA DE RANGO';
set @fechaInicio := '2025-06-01';
set @fechaFin := '2025-06-30 23:59:59';
set @vendor := 'FactSet';

select 
    e.idError as "ID Error",
    e.tipoError as "Tipo de error",
    e.descripcionError as "Descripción",
    e.timestampError as "Fecha del error",
    v.nombreVendor as "Proveedor",
    a.tickerUniversal as "Ticker relacionado",
    a.precioActivo as "Precio del activo"
from error e
join activo a on e.idActivoFK = a.idActivo
join vendor v on e.idVendorFK = v.idVendor
where 
    (@tipoError is null or e.tipoError = @tipoError)
    and (@vendor is null or v.nombreVendor = @vendor)
    and (@fechaInicio is null or e.timestampError between @fechaInicio and @fechaFin)
order by e.timestampError desc;


/* Requisito 20 */
describe activo;
DELIMITER $$
create procedure FiltroActivos(
	in divisaBusqueda varchar(5), 
	in tickerBusqueda varchar(5),
	in regionBusqueda varchar(5), 
	in claseActivoBusqueda varchar(25),
    in fechaBusqueda date)

begin 
	select * from activo where tickerUniversal in (select tickerUniversal from activo where tickerBusqueda is null or tickerUniversal = tickerBusqueda)
		and (divisaBusqueda is null or divisaActivo = divisaBusqueda)
        and (regionBusqueda is null or regionActivo = regionBusqueda)
        and (claseActivoBusqueda is null or claseActivo = claseActivoBusqueda)
        and (fechaBusqueda is null or fechaNeg = fechaBusqueda);

end $$
DELIMITER ;
call FiltroActivos(null, 'XHEL', null, null, '2025-08-22');


/* RQF 21 */

/* Llamen a dios */

/* RQF 22 */

/* Dios ayuda */

/* RQF 23 */

/* Ta doble perro */


/* Requisito 24 */
DELIMITER $$
create trigger ReversionManual
before delete on resultado
for each row
begin
if old.estadoValidacion not like "Us%" then /* Kendrick Referencia */
	signal sqlstate "45000"
	set message_text = "El resultado no es un User Validation";

	end if;
end $$
DELIMITER ;

/* RQF 25 */

create view vista_final_dv as
select 
    v.nombreVendor as "Vendor",
    a.tickerUniversal as "Ticker",
    a.claseActivo as "Tipo de activo",
    a.precioActivo as "Precio",
    a.timestampRecepcion as "Timestamp",
    r.estadoValidacion as "Estado de validación"
from detalleRecepcion dr
join vendor v on dr.idVendorFK = v.idVendor
join activo a on dr.idActivoFK = a.idActivo
left join resultado r on a.tickerUniversal = r.tickerResultado
order by a.timestampRecepcion asc;

select * from vista_final_dv;



/* RQF 26 */

select 
    estadoValidacion as "Tipo de validación",
    count(*) as "Cantidad de validaciones",
    group_concat(distinct tickerResultado order by tickerResultado separator ', ') as "Tickers asociados"
from resultado
group by estadoValidacion;

/* RQF 27 */

set @vendor := 'EDI';
set @tipo := 'SHARE';
set @fechaInicio := '2025-06-01';
set @fechaFin := '2025-06-30 23:59:59';

select 
    v.nombreVendor as "Vendor",
    a.tickerUniversal as "Ticker",             
    a.claseActivo as "Tipo de activo",
    a.precioActivo as "Precio",
    a.timestampRecepcion as "Timestamp"
from detalleRecepcion dr
join vendor v on dr.idVendorFK = v.idVendor
join activo a on dr.idActivoFK = a.idActivo
where 
    v.nombreVendor = @vendor
    and a.claseActivo = @tipo
    and a.timestampRecepcion between @fechaInicio and @fechaFin;

