'use strict'
const
    mecSubjects = [{
            no: 0,
            name: 'QUIMICA LABORATORIO',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [12]
        },
        {
            no: 1,
            name: 'FISICA LABORATORIO',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [8, 9]
        },
        {
            no: 2,
            name: 'TECNOLOGIAS DE LA INFORMACION Y COMUNICACION LABORATORIO',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [17]
        },
        {
            no: 3,
            name: 'ANALISIS MATEMATICO',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [6]
        },
        {
            no: 4,
            name: 'LENGUAJE, COMUNICACION, E INVESTIGACION',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [11]
        },
        {
            no: 5,
            name: 'SEGURIDAD INDUSTRIAL Y SALUD OCUPACIONAL',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [10]
        },
        {
            no: 6,
            name: 'PROCESOS Y GESTION DE CALIDAD INDUSTRIAL',
            level: '2',
            weekly_hours: '2',
            ref: [3],
            next: [15]
        },
        {
            no: 7,
            name: 'FORESTACION E IMPACTO AMBIENTAL',
            level: '2',
            weekly_hours: '2',
            ref: [],
            next: [22]
        },
        {
            no: 8,
            name: 'DIBUJO MECANICO',
            level: '2',
            weekly_hours: '2',
            ref: [1],
            next: [17]
        },
        {
            no: 9,
            name: 'MECANISMOS',
            level: '2',
            weekly_hours: '3',
            ref: [1],
            next: [16]
        },
        {
            no: 10,
            name: 'TALLER MECANICO, METROLOGIA Y AJUSTES',
            level: '2',
            weekly_hours: '2',
            ref: [5],
            next: [16]
        },
        {
            no: 11,
            name: 'INNOVACION Y DISEÑO DE NEGOCIOS INDUSTRIALES',
            level: '2',
            weekly_hours: '2',
            ref: [4],
            next: [19, 28]
        },
        {
            no: 12,
            name: 'TERMODINAMICA',
            level: '3',
            weekly_hours: '2',
            ref: [0],
            next: [20]
        },
        {
            no: 13,
            name: 'MECANICA DE FLUIDOS',
            level: '3',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 14,
            name: 'ELECTROTECNIA LABORATORIO',
            level: '3',
            weekly_hours: '2',
            ref: [],
            next: [23]
        },
        {
            no: 15,
            name: 'MATRICERIA',
            level: '3',
            weekly_hours: '2',
            ref: [6],
            next: [21, 27]
        },
        {
            no: 16,
            name: 'MAQUINAS-HERRAMIENTAS',
            level: '3',
            weekly_hours: '2',
            ref: [9, 10],
            next: [18, 22]
        },
        {
            no: 17,
            name: 'DISEÑO ASISTIDO POR COMPUTADORA LABORATORIO',
            level: '3',
            weekly_hours: '2',
            ref: [8],
            next: []
        },
        {
            no: 18,
            name: 'SOLDADURA',
            level: '4',
            weekly_hours: '2',
            ref: [17],
            next: []
        },
        {
            no: 19,
            name: 'ECONOMIA Y COSTOS INDUSTRIALES',
            level: '4',
            weekly_hours: '2',
            ref: [11],
            next: [28]
        },
        {
            no: 20,
            name: 'RESISTENCIA DE MATERIALES LABORATORIO',
            level: '4',
            weekly_hours: '2',
            ref: [12],
            next: [27]
        },
        {
            no: 21,
            name: 'ESTRUCTURAS METALICAS LABORATORIO',
            level: '4',
            weekly_hours: '2',
            ref: [15],
            next: [24]
        },
        {
            no: 22,
            name: 'MANTENIMIENTO INDUSTRIAL',
            level: '4',
            weekly_hours: '2',
            ref: [16, 7],
            next: []
        },
        {
            no: 23,
            name: 'CONTROL NUMERICO COMPUTARIZADO (CNC)',
            level: '4',
            weekly_hours: '2',
            ref: [14],
            next: [25, 26]
        },
        {
            no: 24,
            name: 'SELECCION DE ELEMENTOS DE MAQUINAS',
            level: '5',
            weekly_hours: '2',
            ref: [21],
            next: []
        },
        {
            no: 25,
            name: 'AUTOMATIZACION INDUSTRIAL LABORATORIO',
            level: '5',
            weekly_hours: '3',
            ref: [23],
            next: []
        },
        {
            no: 26,
            name: 'MAQUINAS TERMICAS Y ELECTRICAS',
            level: '5',
            weekly_hours: '3',
            ref: [23],
            next: []
        },
        {
            no: 27,
            name: 'ENSAYO DE MATERIALES LABORATORIO',
            level: '5',
            weekly_hours: '2',
            ref: [20, 15],
            next: []
        },
        {
            no: 28,
            name: 'PROYECTO DE TITULACION INTEGRADORA | PREPARACION DE EVALUACION COMPLEXIVA',
            level: '5',
            weekly_hours: '5',
            ref: [19, 11],
            next: []
        }
    ],
    diSubjects = [{
            no: 0,
            name: 'COMUNICACION Y LENGUAJE',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 1,
            name: 'CORRIENTES PEDAGOGICAS',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [8]
        },
        {
            no: 2,
            name: 'REALIDAD NACIONAL',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 3,
            name: 'EXPRESION CORPORAL Y ARTISTICA',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 4,
            name: 'DESARROLLO INFANTIL',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [10]
        },
        {
            no: 5,
            name: 'ESTIMULACION 1',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [9]
        },
        {
            no: 6,
            name: 'LEGISLACION, POLITICAS, Y MODELOS PARA LA ATENCION INFANTIL',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: []
        },
        {
            no: 7,
            name: "TIC'S 1",
            level: '2',
            weekly_hours: '3',
            ref: [],
            next: [13]
        },
        {
            no: 8,
            name: 'DISEÑO CURRICULAR 1',
            level: '2',
            weekly_hours: '3',
            ref: [1],
            next: [15]
        },
        {
            no: 9,
            name: 'ESTIMULACION 2',
            level: '2',
            weekly_hours: '4',
            ref: [5],
            next: []
        },
        {
            no: 10,
            name: 'EXPERIENCIAS Y ENTORNOS FAVORABLES PARA EL DESARROLLO BIOSICOSOCIAL',
            level: '2',
            weekly_hours: '3',
            ref: [4],
            next: [17]
        },
        {
            no: 11,
            name: 'SALUD, NUTRICION E HIGIENE',
            level: '2',
            weekly_hours: '4',
            ref: [],
            next: [16]
        },
        {
            no: 12,
            name: 'COMUNICACION ASERTIVA CON LA FAMILIA Y LA COMUNIDAD',
            level: '2',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 13,
            name: "TIC'S 2",
            level: '3',
            weekly_hours: '3',
            ref: [7],
            next: []
        },
        {
            no: 14,
            name: 'LIDERAZGO Y ETICA',
            level: '3',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 15,
            name: 'DISEÑO CURRICULAR 2',
            level: '3',
            weekly_hours: '3',
            ref: [8],
            next: [23]
        },
        {
            no: 16,
            name: 'LITERATURA INFANTIL Y SU DIDACTICA',
            level: '3',
            weekly_hours: '3',
            ref: [11],
            next: []
        },
        {
            no: 17,
            name: 'PRACTICAS DE CRIANZA',
            level: '3',
            weekly_hours: '4',
            ref: [10],
            next: []
        },
        {
            no: 18,
            name: 'METODOS DE INVESTIGACION',
            level: '3',
            weekly_hours: '4',
            ref: [],
            next: []
        },
        {
            no: 19,
            name: 'EMPRENDIMIENTO, ADMINISTRACION Y GESTION DE PROYECTOS',
            level: '4',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 20,
            name: 'RIESGOS Y EMERGENCIAS',
            level: '4',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 21,
            name: 'ATENCION Y PROTECCION A NIÑOS EN CONTEXTOS FAMILIARES E INSTITUCIONALES',
            level: '4',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 22,
            name: 'CUIDANDO AL CUIDADOR',
            level: '4',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 23,
            name: 'DISEÑO Y ELABORACION DE RECURSOS Y AMBIENTES DE APRENDIZAJE',
            level: '4',
            weekly_hours: '3',
            ref: [15],
            next: []
        },
        {
            no: 24,
            name: 'FORMULACION DE PROYECTOS',
            level: '4',
            weekly_hours: '5',
            ref: [],
            next: []
        }
    ],
    mecaSubjects = [{
            no: 0,
            name: 'FISICA-LABORATORIO',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [7]
        },
        {
            no: 1,
            name: 'ELECTROTECNIA',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [6]
        },
        {
            no: 2,
            name: 'SEGURIDAD INDUSTRIAL Y SALUD OCUPACIONAL',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [13]
        },
        {
            no: 3,
            name: 'INNOVACION Y DISEÑO DE NEGOCIOS',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [11]
        },
        {
            no: 4,
            name: 'ANALISIS MATEMATICO',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [9]
        },
        {
            no: 5,
            name: 'LENGUAJE, COMUNICACION E INVESTIGACION',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: []
        },
        {
            no: 6,
            name: 'INTRODUCCION A LA MECATRONICA',
            level: '2',
            weekly_hours: '3',
            ref: [1],
            next: [15]
        },
        {
            no: 7,
            name: "BIOMECANICA",
            level: '2',
            weekly_hours: '2',
            ref: [0],
            next: [12]
        },
        {
            no: 8,
            name: 'DIBUJO MECANICO',
            level: '2',
            weekly_hours: '2',
            ref: [],
            next: [17]
        },
        {
            no: 9,
            name: 'METODOS NUMERICOS Y ELEMENTOS FINITOS',
            level: '2',
            weekly_hours: '2',
            ref: [4],
            next: [16]
        },
        {
            no: 10,
            name: 'MEDIO AMBIENTE Y ENERGIAS RENOVABLES',
            level: '2',
            weekly_hours: '2',
            ref: [],
            next: []
        },
        {
            no: 11,
            name: 'ECONOMIA Y COSTOS',
            level: '2',
            weekly_hours: '2',
            ref: [3],
            next: []
        },
        {
            no: 12,
            name: 'RESISTENCIA DE MATERIALES LABORATORIO',
            level: '3',
            weekly_hours: '2',
            ref: [7],
            next: []
        },
        {
            no: 13,
            name: "TALLER MECANICO, METROLOGIA Y AJUSTES",
            level: '3',
            weekly_hours: '3',
            ref: [2],
            next: []
        },
        {
            no: 14,
            name: 'MAQUINAS-HERRAMIENTAS',
            level: '3',
            weekly_hours: '2',
            ref: [],
            next: [20, 21]
        },
        {
            no: 15,
            name: 'ELECTRONICA LABORATORIO',
            level: '3',
            weekly_hours: '2',
            ref: [6],
            next: [23]
        },
        {
            no: 16,
            name: 'PROGRAMACION LABORATORIO',
            level: '3',
            weekly_hours: '2',
            ref: [9],
            next: [22]
        },
        {
            no: 17,
            name: 'DISEÑO ASISTIDO POR COMPUTADORA LABORATORIO',
            level: '3',
            weekly_hours: '2',
            ref: [8],
            next: [26]
        },
        {
            no: 18,
            name: 'MANUFACTURAS Y MATERIALES INTELIGENTES LABORATORIO',
            level: '4',
            weekly_hours: '2',
            ref: [],
            next: []
        },
        {
            no: 19,
            name: 'TERMOFLUIDOS',
            level: '4',
            weekly_hours: '2',
            ref: [],
            next: [24]
        },
        {
            no: 20,
            name: 'GESTIÓN DE MANTENIMIENTO',
            level: '4',
            weekly_hours: '2',
            ref: [14],
            next: []
        },
        {
            no: 21,
            name: 'MAQUINAS ELECTRICAS',
            level: '4',
            weekly_hours: '2',
            ref: [14],
            next: [24]
        },
        {
            no: 22,
            name: 'SISTEMAS DE CONTROL AUTOMATICO',
            level: '4',
            weekly_hours: '2',
            ref: [16],
            next: [25]
        },
        {
            no: 23,
            name: 'CONTROL ELECTRICO INDUSTRIAL',
            level: '4',
            weekly_hours: '2',
            ref: [15],
            next: [27]
        },
        {
            no: 24,
            name: 'DINAMICA DE CUERPOS RIGIDOS',
            level: '5',
            weekly_hours: '2',
            ref: [19, 21],
            next: []
        },
        {
            no: 25,
            name: 'SISTEMAS DIGITALES LABORATORIO',
            level: '5',
            weekly_hours: '3',
            ref: [16],
            next: []
        },
        {
            no: 26,
            name: 'ROBOTICA INDUSTRIAL',
            level: '5',
            weekly_hours: '3',
            ref: [17],
            next: []
        },
        {
            no: 27,
            name: 'PLC Y REDES INDUSTRIALES',
            level: '5',
            weekly_hours: '2',
            ref: [23],
            next: []
        },
        {
            no: 28,
            name: 'PROYECTO DE TITULACION INTEGRADORA / PREPARACION DE EVALUACION COMPLEXIVA',
            level: '5',
            weekly_hours: '5',
            ref: [],
            next: []
        }
    ],
    moniSubjects = [{
            no: 0,
            name: 'MATEMATICAS',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [8, 9]
        },
        {
            no: 1,
            name: 'FISICA',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [14]
        },
        {
            no: 2,
            name: 'ESTADISTICA',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [9]
        },
        {
            no: 3,
            name: 'BIOLOGIA',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [11]
        },
        {
            no: 4,
            name: 'QUIMICA GENERAL',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [15, 13, 10, 12, 11, 16]
        },
        {
            no: 5,
            name: 'INTRODUCCION A LAS CIENCIAS AMBIENTALES',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 6,
            name: 'INFORMATICA APLICADA',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [23, 18, 22]
        },
        {
            no: 7,
            name: "CONOCIMIENTOS DE SABERES ANCESTRALES",
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [18, 8]
        },
        {
            no: 8,
            name: 'HIDROLOGIA',
            level: '2',
            weekly_hours: '6',
            ref: [0],
            next: [14]
        },
        {
            no: 9,
            name: 'DISEÑO EXPERIMENTAL',
            level: '2',
            weekly_hours: '4',
            ref: [0, 2],
            next: []
        },
        {
            no: 10,
            name: 'MANEJO DE INSTRUMENTOS',
            level: '2',
            weekly_hours: '4',
            ref: [4],
            next: []
        },
        {
            no: 11,
            name: 'MICROBIOLOGIA',
            level: '2',
            weekly_hours: '6',
            ref: [3, 4],
            next: [16]
        },
        {
            no: 12,
            name: 'CONTAMINACION DE RECURSOS HIDRICOS',
            level: '2',
            weekly_hours: '5',
            ref: [4],
            next: [19, 17, 24, 29]
        },
        {
            no: 13,
            name: "MUESTREO DE AGUA",
            level: '2',
            weekly_hours: '5',
            ref: [4],
            next: []
        },
        {
            no: 14,
            name: 'SISTEMAS DE INFORMACION GEOGRAFICA',
            level: '3',
            weekly_hours: '6',
            ref: [8, 1],
            next: [25]
        },
        {
            no: 15,
            name: 'CONTAMINACION DE SUELOS',
            level: '3',
            weekly_hours: '6',
            ref: [4],
            next: [29, 19, 20, 24]
        },
        {
            no: 16,
            name: 'MUESTREOS DE SUELOS Y SEDIMENTOS',
            level: '3',
            weekly_hours: '6',
            ref: [4, 11],
            next: []
        },
        {
            no: 17,
            name: 'MANEJO DE RESIDUOS',
            level: '3',
            weekly_hours: '6',
            ref: [12],
            next: []
        },
        {
            no: 18,
            name: 'COMPOSICION Y REDACCION',
            level: '3',
            weekly_hours: '6',
            ref: [6, 7],
            next: [22]
        },
        {
            no: 19,
            name: 'EVALUACION DE IMPACTO AMBIENTAL',
            level: '4',
            weekly_hours: '6',
            ref: [15, 12],
            next: [24, 29, 27]
        },
        {
            no: 20,
            name: 'CONTAMINACION DEL AIRE',
            level: '4',
            weekly_hours: '6',
            ref: [15],
            next: [25, 29, 26, 24]
        },
        {
            no: 21,
            name: 'MONITOREO DE EMISIONES ATMOSFERICAS',
            level: '4',
            weekly_hours: '6',
            ref: [],
            next: [26]
        },
        {
            no: 22,
            name: 'ELABORACION DE PROYECTOS',
            level: '4',
            weekly_hours: '5',
            ref: [18, 6],
            next: []
        },
        {
            no: 23,
            name: 'SEGURIDAD FISICA EN EL TRABAJO',
            level: '4',
            weekly_hours: '5',
            ref: [6],
            next: []
        },
        {
            no: 24,
            name: 'POLITICA Y LEGISLACION AMBIENTAL',
            level: '5',
            weekly_hours: '6',
            ref: [19, 12, 15, 20],
            next: []
        },
        {
            no: 25,
            name: 'MONITOREO DE RUIDO AMBIENTAL',
            level: '5',
            weekly_hours: '5',
            ref: [20, 14],
            next: []
        },
        {
            no: 26,
            name: 'MONITOREO DE CALIDAD DE AIRE',
            level: '5',
            weekly_hours: '5',
            ref: [21, 20],
            next: []
        },
        {
            no: 27,
            name: 'NORMATIVA INTERNACIONAL PARA LA GESTION Y SEGURIDAD',
            level: '5',
            weekly_hours: '5',
            ref: [19],
            next: []
        },
        {
            no: 28,
            name: 'ETICA PROFESIONAL',
            level: '5',
            weekly_hours: '4',
            ref: [],
            next: []
        },
        {
            no: 29,
            name: 'TRABAJO DE TITULACION',
            level: '5',
            weekly_hours: '3',
            ref: [19, 20, 15, 12],
            next: []
        }
    ],
    autoSubjects = [{
            no: 0,
            name: 'ANALISIS MATEMATICO',
            level: '1',
            weekly_hours: '6',
            ref: [],
            next: [6]
        },
        {
            no: 1,
            name: 'ELECTROTECNIA',
            level: '1',
            weekly_hours: '7',
            ref: [],
            next: [7, 8, 10]
        },
        {
            no: 2,
            name: 'FISICA GENERAL',
            level: '1',
            weekly_hours: '5',
            ref: [],
            next: [7, 8, 14]
        },
        {
            no: 3,
            name: 'INFORMATICA INDUSTRIAL',
            level: '1',
            weekly_hours: '6',
            ref: [],
            next: [9]
        },
        {
            no: 4,
            name: 'CULTURA Y DIVERSIDAD',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 5,
            name: 'COMUNICACION Y LENGUAJE',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 6,
            name: 'MATEMATICAS APLICADAS',
            level: '2',
            weekly_hours: '5',
            ref: [0],
            next: [12]
        },
        {
            no: 7,
            name: "SISTEMAS DE PERCEPCION ARTIFICIAL",
            level: '2',
            weekly_hours: '5',
            ref: [1, 2],
            next: [15]
        },
        {
            no: 8,
            name: 'ELECTRONICA ANALOGICA E INSTRUMENTACION',
            level: '2',
            weekly_hours: '7',
            ref: [1, 2],
            next: [15, 13],
            ancl: 7
        },
        {
            no: 9,
            name: 'PROGRAMACION ESTRUCTURADA',
            level: '2',
            weekly_hours: '5',
            ref: [3],
            next: [15]
        },
        {
            no: 10,
            name: 'MANTENIMIENTO DE EQUIPOS ELECTRICOS Y ELECTRONICOS',
            level: '2',
            weekly_hours: '5',
            ref: [1],
            next: [16]
        },
        {
            no: 11,
            name: 'SEGURIDAD LABORAL',
            level: '2',
            weekly_hours: '4',
            ref: [],
            next: []
        },
        {
            no: 12,
            name: 'METODOS MATEMATICOS',
            level: '3',
            weekly_hours: '5',
            ref: [6],
            next: [18]
        },
        {
            no: 13,
            name: "ELECTRONICA DE POTENCIA",
            level: '3',
            weekly_hours: '5',
            ref: [8],
            next: [26]
        },
        {
            no: 14,
            name: 'MAQUINAS ELECTRICAS',
            level: '3',
            weekly_hours: '5',
            ref: [2],
            next: [26],
            ancl: 13
        },
        {
            no: 15,
            name: 'SISTEMAS ELECTRONICOS DIGITALES',
            level: '3',
            weekly_hours: '5',
            next: [20, 21],
            ref: [7, 8, 9]
        },
        {
            no: 16,
            name: 'DISEÑO Y FABRICACION DE EQUIPOS ELECTRICOS Y ELECTRONICOS',
            level: '3',
            weekly_hours: '7',
            ref: [10],
            next: [],
            ancl: 15
        },
        {
            no: 17,
            name: 'INDUSTRIA Y MEDIOAMBIENTE',
            level: '3',
            weekly_hours: '4',
            next: [],
            ref: []
        },
        {
            no: 18,
            name: 'EMPRENDIMIENTO E INNOVACION EMPRESARIAL',
            level: '4',
            weekly_hours: '4',
            ref: [12],
            next: [24]
        },
        {
            no: 19,
            name: 'INTRODUCCION AL TRABAJO DE TITULACION',
            level: '4',
            weekly_hours: '4',
            ref: [],
            next: [24]
        },
        {
            no: 20,
            name: 'SISTEMAS SCADA',
            level: '4',
            weekly_hours: '5',
            ref: [15],
            next: [25]
        },
        {
            no: 21,
            name: 'PROGRAMACION DE SISTEMAS DE AUTOMATIZACION INDUSTRIAL',
            level: '4',
            weekly_hours: '7',
            ref: [15],
            next: [26],
            ancl: 20
        },
        {
            no: 22,
            name: 'REGULACION AUTOMATICA',
            level: '4',
            weekly_hours: '7',
            ref: [],
            next: [26, 27],
            ancl: 21
        },
        {
            no: 23,
            name: 'GESTION DE CALIDAD',
            level: '4',
            weekly_hours: '4',
            ref: [],
            next: []
        },
        {
            no: 24,
            name: 'TRABAJO DE TITULACION',
            level: '5',
            weekly_hours: '4',
            ref: [18, 19],
            next: []
        },
        {
            no: 25,
            name: 'TELECOMUNICACIONES INDUSTRIALES',
            level: '5',
            weekly_hours: '5',
            ref: [20],
            next: []
        },
        {
            no: 26,
            name: 'CONTROL ELECTRICO INDUSTRIAL',
            level: '5',
            weekly_hours: '7',
            ref: [21, 22, 13, 14],
            next: []
        },
        {
            no: 27,
            name: 'NEUMATICA',
            level: '5',
            weekly_hours: '5',
            ref: [22],
            next: [],
            ancl: 26
        },
        {
            no: 28,
            name: 'PROCESOS DE MANTENIMIENTO INDUSTRIAL',
            level: '5',
            weekly_hours: '5',
            ref: [],
            next: []
        }
    ],
    rieSubjects = [{
            no: 0,
            name: 'MATEMATICA APLICADAS',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [6]
        },
        {
            no: 1,
            name: 'FISICA APLICADA',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [8]
        },
        {
            no: 2,
            name: 'QUIMICA GENERAL',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [8]
        },
        {
            no: 3,
            name: 'INTRODUCCION A PRESUPUESTOS EMPRESARIALES',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [10]
        },
        {
            no: 4,
            name: 'HERRAMIENTAS TIC EN PREVENCION DE RIESGOS',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [9]
        },
        {
            no: 5,
            name: 'EXPRESION ORAL Y ESCRITA',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [10, 11]
        },
        {
            no: 6,
            name: 'ESTADISTICA Y PROBABILIDADES',
            level: '2',
            weekly_hours: '3',
            ref: [0],
            next: [15]
        },
        {
            no: 7,
            name: 'FUNDAMENTOS Y TECNICAS DE PREVENCION DE RIESGOS',
            level: '2',
            weekly_hours: '4',
            ref: [],
            next: [13]
        },
        {
            no: 8,
            name: 'ELECTRICIDAD, MAGNETISMO Y RADIACION',
            level: '2',
            weekly_hours: '3',
            ref: [1, 2],
            next: []
        },
        {
            no: 9,
            name: 'DISEÑO ASISTIDO POR COMPUTADORA',
            level: '2',
            weekly_hours: '3',
            ref: [4],
            next: [17]
        },
        {
            no: 10,
            name: 'EMPRENDIMIENTO E INNOVACION EN LA INDUSTRIA',
            level: '2',
            weekly_hours: '3',
            ref: [3, 5],
            next: [14]
        },
        {
            no: 11,
            name: 'DESARROLLO LOCAL',
            level: '2',
            weekly_hours: '3',
            ref: [5],
            next: []
        },
        {
            no: 12,
            name: 'MARCO LEGAL DE LA PREVENCION DE RIESGOS',
            level: '3',
            weekly_hours: '3',
            ref: [],
            next: [18]
        },
        {
            no: 13,
            name: "SALUD OCUPACIONAL EN LA INDUSTRIA I",
            level: '3',
            weekly_hours: '4',
            ref: [7],
            next: [19]
        },
        {
            no: 14,
            name: 'RECURSOS HUMANOS Y GESTION DE PERSONAL',
            level: '3',
            weekly_hours: '2',
            ref: [10],
            next: []
        },
        {
            no: 15,
            name: 'OPERACIONES Y PROCESOS INDUSTRIALES',
            level: '3',
            weekly_hours: '3',
            next: [22],
            ref: [6]
        },
        {
            no: 16,
            name: 'CONTROL DE EMERGENCIAS',
            level: '3',
            weekly_hours: '3',
            ref: [],
            next: [23]
        },
        {
            no: 17,
            name: 'NORMAS Y PROCEDIMIENTOS DE SEGURIDAD',
            level: '3',
            weekly_hours: '4',
            next: [20],
            ref: [9]
        },
        {
            no: 18,
            name: 'HIGIENE Y SEGURIDAD INDUSTRIAL',
            level: '4',
            weekly_hours: '3',
            ref: [12],
            next: []
        },
        {
            no: 19,
            name: 'SALUD OCUPACIONAL EN LA INDUSTRIA II',
            level: '4',
            weekly_hours: '4',
            ref: [13],
            next: [28]
        },
        {
            no: 20,
            name: 'ERGONOMIA APLICADA',
            level: '4',
            weekly_hours: '2',
            ref: [17],
            next: [24]
        },
        {
            no: 21,
            name: 'AMBIENTE Y RESPONSABILIDAD SOCIAL',
            level: '4',
            weekly_hours: '3',
            ref: [],
            next: [27]
        },
        {
            no: 22,
            name: 'PLANES DE EMERGENCIA Y SIMULACROS',
            level: '4',
            weekly_hours: '3',
            ref: [15],
            next: [26]
        },
        {
            no: 23,
            name: 'MANEJO DE MATERIALES PELIGROSOS',
            level: '4',
            weekly_hours: '3',
            ref: [16],
            next: [25]
        },
        {
            no: 24,
            name: 'PLANIFICACION Y AUDITORIA DE PUESTOS DE TRABAJO',
            level: '5',
            weekly_hours: '1',
            ref: [20],
            next: []
        },
        {
            no: 25,
            name: 'SEGURIDAD INDUSTRIAL Y RIESGOS DEL SECTOR PETROLERO',
            level: '5',
            weekly_hours: '4',
            ref: [23],
            next: []
        },
        {
            no: 26,
            name: 'SISTEMAS INTEGRADOS Y GESTION DE RIESGOS',
            level: '5',
            weekly_hours: '3',
            ref: [22],
            next: []
        },
        {
            no: 27,
            name: 'BIOSEGURIDAD Y RIESGOS QUIMICOS',
            level: '5',
            weekly_hours: '3',
            ref: [21],
            next: []
        },
        {
            no: 28,
            name: 'INVESTIGACION APLICADA A LA SEGURIDAD',
            level: '5',
            weekly_hours: '3',
            ref: [19],
            next: []
        }
    ],
    solSubjects = [{
            no: 0,
            name: 'FISICA APLICADA',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [7, 9]
        },
        {
            no: 1,
            name: 'MATEMATICA APLICADA',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [7]
        },
        {
            no: 2,
            name: 'METROLOGIA',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [10]
        },
        {
            no: 3,
            name: 'QUIMICA APLICADA',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [11]
        },
        {
            no: 4,
            name: 'ELECTRICIDAD Y MAGNETISMO',
            level: '1',
            weekly_hours: '3',
            ref: [],
            next: [12]
        },
        {
            no: 5,
            name: 'SALUD Y SEGURIDAD LABORAL',
            level: '1',
            weekly_hours: '2',
            ref: [],
            next: [12]
        },
        {
            no: 6,
            name: 'SOLDADURA POR ARCO DE METAL PROTEGIDO-SMAW, OAW, PAC',
            level: '1',
            weekly_hours: '4',
            ref: [],
            next: [8]
        },
        {
            no: 7,
            name: 'ELABORACION DE PLANOS POR COMPUTADOR',
            level: '2',
            weekly_hours: '3',
            ref: [0, 1],
            next: []
        },
        {
            no: 8,
            name: 'SOLDADURA CON ALAMBRE CONTINUO PROTEGIDO CON GAS-GMAW',
            level: '2',
            weekly_hours: '5',
            ref: [6],
            next: [13]
        },
        {
            no: 9,
            name: 'PROCESOS TERMICOS APLICADOS A LA SOLDADURA',
            level: '2',
            weekly_hours: '3',
            ref: [0],
            next: []
        },
        {
            no: 10,
            name: 'NORMATIVAS PARA EL CONTROL DE CALIDAD DE SOLDADURA',
            level: '2',
            weekly_hours: '3',
            ref: [2],
            next: [17, 15]
        },
        {
            no: 11,
            name: 'METALOGRAFIA',
            level: '2',
            weekly_hours: '3',
            ref: [3],
            next: [16]
        },
        {
            no: 12,
            name: 'MANTENIMIENTO DE EQUIPOS DE SOLDAR',
            level: '2',
            weekly_hours: '3',
            ref: [4, 5],
            next: []
        },
        {
            no: 13,
            name: 'SOLDADURA POR ARCO ELECTRICO-GTAW',
            level: '3',
            weekly_hours: '6',
            ref: [8],
            next: [18, 19]
        },
        {
            no: 14,
            name: 'SOLDADURA DE MANTENIMIENTO',
            level: '3',
            weekly_hours: '4',
            next: [],
            ref: []
        },
        {
            no: 15,
            name: "DEFECTOLOGIA EN UNIONES SOLDABLES",
            level: '3',
            weekly_hours: '3',
            ref: [10],
            next: [20]
        },
        {
            no: 16,
            name: 'RESISTENCIA DE LOS MATERIALES',
            level: '3',
            weekly_hours: '3',
            ref: [11],
            next: []
        },
        {
            no: 17,
            name: 'ESTRUCTURAS METALICAS',
            level: '3',
            weekly_hours: '4',
            next: [],
            ref: [10]
        },
        {
            no: 18,
            name: 'PROCESO DE SOLDADURA SAW SEMIAUTOMATIZADO',
            level: '4',
            weekly_hours: '5',
            ref: [13],
            next: [23]
        },
        {
            no: 19,
            name: 'SOLDADURA PROCESO FCAW',
            level: '4',
            weekly_hours: '5',
            ref: [13],
            next: [23]
        },
        {
            no: 20,
            name: 'ENSAYOS DESTRUCTIVOS Y NO DESTRUCTIVOS LABORATORIO',
            level: '4',
            weekly_hours: '4',
            ref: [15],
            next: [24]
        },
        {
            no: 21,
            name: 'LIDERAZGO Y EMPRENDIMIENTO',
            level: '4',
            weekly_hours: '3',
            ref: [],
            next: []
        },
        {
            no: 22,
            name: 'LEGISLACION Y ETICA LABORAL',
            level: '4',
            weekly_hours: '3',
            ref: [],
            next: [25]
        },
        {
            no: 23,
            name: 'SOLDADURA SUBACUATICA',
            level: '5',
            weekly_hours: '5',
            ref: [18, 19],
            next: []
        },
        {
            no: 24,
            name: 'GESTION DE MANTENIMIENTO Y CONTROL DE CALIDAD',
            level: '5',
            weekly_hours: '4',
            ref: [20],
            next: []
        },
        {
            no: 25,
            name: 'REALIDAD NACIONAL Y MEDIO AMBIENTE',
            level: '5',
            weekly_hours: '3',
            ref: [22],
            next: []
        },
        {
            no: 26,
            name: 'DESARROLLO DE PLANES OPERATIVOS DE SOLDADURA',
            level: '5',
            weekly_hours: '5',
            ref: [],
            next: []
        }
    ]

module.exports = {
    mecSubjects,
    diSubjects,
    mecaSubjects,
    moniSubjects,
    autoSubjects,
    rieSubjects,
    solSubjects
}