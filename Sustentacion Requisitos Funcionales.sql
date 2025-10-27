/*==============================================
	Entrega sustentacion Requisitos Funcionales
	Nicolle Stefany Garaviz Sanchez			
 ===============================================*/
 
use solactive_price_validation;
 
/*==============================================
				TABLAS USADAS			
 ===============================================*/
 
 -- VENDOR
 
 create table vendor(
	idVendor int not null auto_increment primary key,
    nombreVendor varchar(50) not null,
    emailSoporte varchar(255) not null,
    importanciaVendor int not null
);
 
 -- DETALLE RECEPCION 
 
 create table detalleRecepcion(
	idRecepcion int not null auto_increment primary key,
    idVendorFK int not null,
    idActivoFK int not null,
    foreign key (idVendorFK) references vendor(idVendor),
    foreign key (idActivoFK) references activo(idActivo)
);

 -- ACTIVO
 
 create table activo(
	idActivo int auto_increment primary key,
    precioActivo float,
    timestampRecepcion timestamp,
    divisaActivo varchar(5) not null,
    tickerUniversal varchar(10) not null,
    regionActivo varchar(25) not null,
    claseActivo varchar(50) not null
);
 
 -- RESULTADO
 
 create table resultado(
	idActivoFK int not null unique,
	idResultado int auto_increment primary key,
    observacionResultado varchar(255),
    foreign key (idActivoFK) references activo(idActivo)
);
 
 
 /*============================================
			REQUISITOS FUNCIONALES
   ============================================*/
 
 
/* ---- REQUISITO 11 - PROCEDIMIENTO ----
NOMBRE: Jerarquizacion de vendors
DESCRIPCION: El sistema GDV debe permitir al usuario consultar la jerarquıa de importancia entre vendors de informacion
USUARIOS: Division de Price Data */

DELIMITER $$

create procedure consultarJerarquia()
begin 
	select nombreVendor as 'Nombre Vendor', importanciaVendor as 'Importancia Vendor' from vendor order by importanciaVendor;
end $$

DELIMITER ;

call consultarJerarquia;


/* ---- REQUISITO 28 - VISTA ----
NOMBRE: Comparacion entre vendors
DESCRIPCION: El sistema DV debe mostrar las estadısticas de inconsistencias de cada vendor y su frecuencia
USUARIOS: Division de Equity Core */


create view comparacionVendor as
select v.nombreVendor as "Vendor",
    count(distinct dr.idActivoFK) as "Total Activos",
    sum(case
            when r.estadoValidacion <> 'Validated' 
            then 1 
            else 0 
        end) as "Inconsistencias",
    concat(
        round(
            (sum(case 
                    when r.estadoValidacion <> 'Validated' 
                    then 1 
                    else 0 
                end) / count(distinct dr.idActivoFK)) * 100, 
            2
        ),
        '%'
    ) as "Porcentaje Inconsistencia"
from vendor v
join detalleRecepcion dr on v.idVendor = dr.idVendorFK
join activo a on dr.idActivoFK = a.idActivo
left join resultado r on a.idActivo = r.idActivoFK
group by v.idVendor, v.nombreVendor
order by "Inconsistencias" desc;


select * from comparacionVendor;

