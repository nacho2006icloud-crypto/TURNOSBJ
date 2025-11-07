-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: turnosbj
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'b5be2f1a-b9f2-11f0-86eb-7c25da00dced:1-74';

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `local_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`usuario_id`,`local_id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_local_id` (`local_id`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`local_id`) REFERENCES `locales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_disponibles`
--

DROP TABLE IF EXISTS `horarios_disponibles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_disponibles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `local_id` int NOT NULL,
  `dia` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Día de la semana',
  `hora_inicio` time NOT NULL COMMENT 'Hora de inicio del turno (ej: 09:00)',
  `hora_fin` time NOT NULL COMMENT 'Hora de fin del turno (ej: 10:00)',
  `max_integrantes` int DEFAULT NULL COMMENT 'Máximo de personas por turno (ej: 10 para F5, 14 para F7)',
  `deporte` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Futbol 5',
  `disponible` tinyint(1) DEFAULT '1' COMMENT 'Si el turno está habilitado o deshabilitado',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_local_dia` (`local_id`,`dia`),
  KEY `idx_disponible` (`disponible`),
  CONSTRAINT `horarios_disponibles_ibfk_1` FOREIGN KEY (`local_id`) REFERENCES `locales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_disponibles`
--

LOCK TABLES `horarios_disponibles` WRITE;
/*!40000 ALTER TABLE `horarios_disponibles` DISABLE KEYS */;
/*!40000 ALTER TABLE `horarios_disponibles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locales`
--

DROP TABLE IF EXISTS `locales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `fotos` json DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `deportes` json DEFAULT NULL,
  `precio_hora` decimal(10,2) DEFAULT '0.00',
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `visible` tinyint(1) DEFAULT '0' COMMENT 'Si la cancha es visible para usuarios',
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_precio_hora` (`precio_hora`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `locales_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locales`
--

LOCK TABLES `locales` WRITE;
/*!40000 ALTER TABLE `locales` DISABLE KEYS */;
INSERT INTO `locales` VALUES (1,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Deportivo Norte','Av. Libertador 1234, CABA',-34.58750000,-58.39740000,'[]',NULL,'[\"futbol\", \"tenis\"]',5000.00,4.50,0,1,'2025-11-06 12:21:07','2025-11-06 12:21:07',0),(2,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Sur','Av. Rivadavia 5678, CABA',-34.61180000,-58.39600000,'[]',NULL,'[\"futbol\", \"basquet\", \"padel\"]',7500.00,4.80,0,1,'2025-11-06 12:21:07','2025-11-06 12:21:07',0),(3,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Cancha Norte 2','Av. Cabildo 2468, CABA',-34.56780000,-58.45670000,'[]',NULL,'[\"futbol\"]',6000.00,4.20,0,1,'2025-11-06 12:21:07','2025-11-06 12:21:07',0),(4,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Polideportivo Sur','Av. San Juan 1357, CABA',-34.62340000,-58.38900000,'[]',NULL,'[\"basquet\", \"voley\", \"handball\"]',8000.00,4.70,0,1,'2025-11-06 12:21:07','2025-11-06 12:21:07',0),(5,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Deportivo Norte','Av. Libertador 1234, CABA',-34.58750000,-58.39740000,'[]',NULL,'[\"futbol\", \"tenis\"]',5000.00,4.50,0,1,'2025-11-06 13:04:14','2025-11-06 13:04:14',0),(6,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Sur','Av. Rivadavia 5678, CABA',-34.61180000,-58.39600000,'[]',NULL,'[\"futbol\", \"basquet\", \"padel\"]',7500.00,4.80,0,1,'2025-11-06 13:04:14','2025-11-06 13:04:14',0),(7,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Cancha Norte 2','Av. Cabildo 2468, CABA',-34.56780000,-58.45670000,'[]',NULL,'[\"futbol\"]',6000.00,4.20,0,1,'2025-11-06 13:04:14','2025-11-06 13:04:14',0),(8,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Polideportivo Sur','Av. San Juan 1357, CABA',-34.62340000,-58.38900000,'[]',NULL,'[\"basquet\", \"voley\", \"handball\"]',8000.00,4.70,0,1,'2025-11-06 13:04:14','2025-11-06 13:04:14',0),(9,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Deportivo Norte','Av. Libertador 1234, CABA',-34.58750000,-58.39740000,'[]',NULL,'[\"futbol\", \"tenis\"]',5000.00,4.50,0,1,'2025-11-06 16:48:48','2025-11-06 16:48:48',0),(10,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Sur','Av. Rivadavia 5678, CABA',-34.61180000,-58.39600000,'[]',NULL,'[\"futbol\", \"basquet\", \"padel\"]',7500.00,4.80,0,1,'2025-11-06 16:48:48','2025-11-06 16:48:48',0),(11,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Cancha Norte 2','Av. Cabildo 2468, CABA',-34.56780000,-58.45670000,'[]',NULL,'[\"futbol\"]',6000.00,4.20,0,1,'2025-11-06 16:48:48','2025-11-06 16:48:48',0),(12,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Polideportivo Sur','Av. San Juan 1357, CABA',-34.62340000,-58.38900000,'[]',NULL,'[\"basquet\", \"voley\", \"handball\"]',8000.00,4.70,0,1,'2025-11-06 16:48:48','2025-11-06 16:48:48',0),(13,15,'X','$2b$12$2AXAqPGxRdOaEbveNfSCNeDt4oCvyotqTV9WStCQUXj3kCEwriQMq','X','X',NULL,NULL,'[]','','[]',0.00,0.00,0,1,'2025-11-06 18:07:28','2025-11-06 18:07:28',0),(14,16,'ALAVEZla','$2b$12$y24xFDnA8xuebY5aNhHLOeCoksJwZNiHto4LPAaqCu/9n6GKBiGom','hola','hola',NULL,NULL,'[]','','[]',0.00,0.00,0,1,'2025-11-07 12:27:21','2025-11-07 12:27:21',0);
/*!40000 ALTER TABLE `locales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partidos`
--

DROP TABLE IF EXISTS `partidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `local_id` int DEFAULT NULL,
  `deporte` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `estado` enum('agendado','disputado','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'agendado',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `local_id` (`local_id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_deporte` (`deporte`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `partidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `partidos_ibfk_2` FOREIGN KEY (`local_id`) REFERENCES `locales` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partidos`
--

LOCK TABLES `partidos` WRITE;
/*!40000 ALTER TABLE `partidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `partidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `local_id` int NOT NULL,
  `horario_id` int DEFAULT NULL COMMENT 'Referencia al turno reservado',
  `fecha_reserva` date DEFAULT NULL COMMENT 'Fecha específica de la reserva',
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `deporte` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada','completada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_local_id` (`local_id`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_estado` (`estado`),
  KEY `idx_horario_id` (`horario_id`),
  KEY `idx_fecha_reserva` (`fecha_reserva`),
  CONSTRAINT `reservas_horario_fk` FOREIGN KEY (`horario_id`) REFERENCES `horarios_disponibles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`local_id`) REFERENCES `locales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones`
--

DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` enum('usuario','local') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
INSERT INTO `sesiones` VALUES (5,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjQ0NjU4MywiZXhwIjoxNzY1MDM4NTgzfQ.gv3UeUcRyoN8ScbwTU2RZwHTW_FzdmkvC1d5vTQJ7p8','usuario','2025-12-06 16:29:43','2025-11-06 16:29:43'),(7,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjQ0ODU5MiwiZXhwIjoxNzY1MDQwNTkyfQ.mCAys-ok_TDliafSFVltjaMV1N38jZoW8ngIrV2rR0w','usuario','2025-12-06 17:03:13','2025-11-06 17:03:12'),(14,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjUyMDM4MSwiZXhwIjoxNzY1MTEyMzgxfQ.EY9lvoM-PE6sKRHZnM5KUuFxAkRX2sGwfHYSNShV7YI','usuario','2025-12-07 12:59:41','2025-11-07 12:59:41'),(15,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjUyMzM5NiwiZXhwIjoxNzY1MTE1Mzk2fQ.PPPxpJz58O9orc_ifiZC2CyavRer-H7GVvTWMa4oa-Y','usuario','2025-12-07 13:49:56','2025-11-07 13:49:56');
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ano_nacimiento` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_usuario` enum('usuario','local') COLLATE utf8mb4_unicode_ci DEFAULT 'usuario',
  `foto_perfil` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_tipo_usuario` (`tipo_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Club Deportivo Norte','norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW',NULL,'local',NULL,NULL,'2025-11-06 12:21:07','2025-11-06 12:21:07'),(2,'Club Sur','sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW',NULL,'local',NULL,NULL,'2025-11-06 12:21:07','2025-11-06 12:21:07'),(3,'Juan Pérez','juan@email.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW',NULL,'usuario',NULL,NULL,'2025-11-06 12:21:07','2025-11-06 12:21:07'),(7,'i','1','$2b$12$Me/j2yhX5LH3jgypWRNLT.3N7WXccFBFfr1HNlFjy3EJLp.tQbXhe','1','usuario',NULL,NULL,'2025-11-06 13:11:37','2025-11-06 13:11:37'),(8,'d','f@gmail.com','$2b$12$Pgjf3XWQBA5L/74CaagiwOqlyYgFjjDk2nXdACftVZ.OLgWSiHleW','2006','usuario',NULL,NULL,'2025-11-06 14:13:27','2025-11-06 14:13:27'),(9,'EXOTICA','MIAMI','$2b$12$oZX4BdDJ7ywO/36Vae7EvO80nxe6BJg/Fr/lNfEB8/c40d0WicBYe','1999','usuario',NULL,NULL,'2025-11-06 16:25:52','2025-11-06 16:25:52'),(10,'EY','ALAVEZ','$2b$12$SBYEkaJ7N18FBX67jBVMQ.bT/JqCdu6ybVFkF78YJiFkyNduA7Ir6','1999','usuario','/uploads/profiles/profile-1762448578782-95271117.jpg',NULL,'2025-11-06 16:29:18','2025-11-06 17:02:58'),(14,'LAL','LAL','$2b$12$Xudh3lsBLTv25x1qcLIKdO/ABmWECtObOIrpgA7MW0vs6q8kptpQ6',NULL,'local',NULL,NULL,'2025-11-06 17:51:31','2025-11-06 17:51:31'),(15,'X','X','$2b$12$2AXAqPGxRdOaEbveNfSCNeDt4oCvyotqTV9WStCQUXj3kCEwriQMq',NULL,'local',NULL,NULL,'2025-11-06 18:07:28','2025-11-06 18:07:28'),(16,'hola','ALAVEZla','$2b$12$y24xFDnA8xuebY5aNhHLOeCoksJwZNiHto4LPAaqCu/9n6GKBiGom',NULL,'local',NULL,NULL,'2025-11-07 12:27:21','2025-11-07 12:27:21');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-07 11:33:42
