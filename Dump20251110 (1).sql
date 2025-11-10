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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'b5be2f1a-b9f2-11f0-86eb-7c25da00dced:1-166';

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_disponibles`
--

LOCK TABLES `horarios_disponibles` WRITE;
/*!40000 ALTER TABLE `horarios_disponibles` DISABLE KEYS */;
INSERT INTO `horarios_disponibles` VALUES (1,15,'Martes','05:00:00','06:00:00',10,'Futbol 5',1,'2025-11-10 16:50:53','2025-11-10 16:50:53'),(2,15,'Lunes','05:00:00','06:00:00',10,'Futbol 5',1,'2025-11-10 16:50:53','2025-11-10 16:52:02'),(3,15,'Domingo','05:00:00','06:00:00',10,'Futbol 5',1,'2025-11-10 16:50:53','2025-11-10 16:50:53'),(4,15,'Miércoles','05:00:00','06:00:00',10,'Futbol 5',1,'2025-11-10 16:50:53','2025-11-10 16:50:53'),(5,15,'Sábado','05:00:00','06:00:00',10,'Futbol 5',1,'2025-11-10 16:50:53','2025-11-10 16:50:53'),(6,15,'Jueves','05:00:00','06:00:00',10,'Futbol 5',1,'2025-11-10 16:50:53','2025-11-10 16:50:53'),(7,15,'Viernes','05:00:00','06:00:00',10,'Futbol 5',1,'2025-11-10 16:50:54','2025-11-10 16:50:54'),(8,15,'Miércoles','09:00:00','10:30:00',14,'Futbol 7',1,'2025-11-10 17:45:01','2025-11-10 17:45:01'),(9,15,'Lunes','09:00:00','10:30:00',14,'Futbol 7',1,'2025-11-10 17:45:01','2025-11-10 17:45:01'),(10,15,'Sábado','09:00:00','10:30:00',14,'Futbol 7',1,'2025-11-10 17:45:01','2025-11-10 17:45:01'),(11,15,'Martes','09:00:00','10:30:00',14,'Futbol 7',1,'2025-11-10 17:45:01','2025-11-10 17:45:01'),(12,15,'Viernes','09:00:00','10:30:00',14,'Futbol 7',1,'2025-11-10 17:45:01','2025-11-10 17:45:01'),(13,15,'Jueves','09:00:00','10:30:00',14,'Futbol 7',1,'2025-11-10 17:45:01','2025-11-10 17:45:01'),(14,15,'Domingo','09:00:00','10:30:00',14,'Futbol 7',1,'2025-11-10 17:45:02','2025-11-10 17:45:02'),(15,15,'Lunes','09:00:00','10:00:00',2,'Tenis',1,'2025-11-10 17:46:16','2025-11-10 17:46:16'),(16,15,'Jueves','09:00:00','10:00:00',2,'Tenis',1,'2025-11-10 17:46:16','2025-11-10 17:46:16'),(17,15,'Martes','09:00:00','10:00:00',2,'Tenis',1,'2025-11-10 17:46:16','2025-11-10 17:46:16'),(18,15,'Domingo','09:00:00','10:00:00',2,'Tenis',1,'2025-11-10 17:46:16','2025-11-10 17:46:16'),(19,15,'Miércoles','09:00:00','10:00:00',2,'Tenis',1,'2025-11-10 17:46:17','2025-11-10 17:46:17'),(20,15,'Sábado','09:00:00','10:00:00',2,'Tenis',1,'2025-11-10 17:46:17','2025-11-10 17:46:17'),(21,15,'Viernes','09:00:00','10:00:00',2,'Tenis',1,'2025-11-10 17:46:17','2025-11-10 17:46:17');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locales`
--

LOCK TABLES `locales` WRITE;
/*!40000 ALTER TABLE `locales` DISABLE KEYS */;
INSERT INTO `locales` VALUES (1,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Deportivo Norte','Av. Libertador 1234, CABA',-34.58750000,-58.39740000,'[]',NULL,'[\"Futbol 5\", \"Tenis\"]',5000.00,4.50,0,1,'2025-11-06 12:21:07','2025-11-10 19:10:45',0),(2,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Sur','Av. Rivadavia 5678, CABA',-34.61180000,-58.39600000,'[]',NULL,'[\"Futbol 5\", \"Basquet\", \"Padel\"]',7500.00,4.80,0,1,'2025-11-06 12:21:07','2025-11-10 19:10:45',0),(3,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Cancha Norte 2','Av. Cabildo 2468, CABA',-34.56780000,-58.45670000,'[]',NULL,'[\"Futbol 5\"]',6000.00,4.20,0,1,'2025-11-06 12:21:07','2025-11-10 19:10:45',0),(4,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Polideportivo Sur','Av. San Juan 1357, CABA',-34.62340000,-58.38900000,'[]',NULL,'[\"Basquet\", \"Voley\"]',8000.00,4.70,0,1,'2025-11-06 12:21:07','2025-11-10 19:10:45',0),(5,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Deportivo Norte','Av. Libertador 1234, CABA',-34.58750000,-58.39740000,'[]',NULL,'[\"Futbol 5\", \"Tenis\"]',5000.00,4.50,0,1,'2025-11-06 13:04:14','2025-11-10 19:10:45',0),(6,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Sur','Av. Rivadavia 5678, CABA',-34.61180000,-58.39600000,'[]',NULL,'[\"Futbol 5\", \"Basquet\", \"Padel\"]',7500.00,4.80,0,1,'2025-11-06 13:04:14','2025-11-10 19:10:45',0),(7,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Cancha Norte 2','Av. Cabildo 2468, CABA',-34.56780000,-58.45670000,'[]',NULL,'[\"Futbol 5\"]',6000.00,4.20,0,1,'2025-11-06 13:04:14','2025-11-10 19:10:45',0),(8,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Polideportivo Sur','Av. San Juan 1357, CABA',-34.62340000,-58.38900000,'[]',NULL,'[\"Basquet\", \"Voley\"]',8000.00,4.70,0,1,'2025-11-06 13:04:14','2025-11-10 19:10:45',0),(9,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Deportivo Norte','Av. Libertador 1234, CABA',-34.58750000,-58.39740000,'[]',NULL,'[\"Futbol 5\", \"Tenis\"]',5000.00,4.50,0,1,'2025-11-06 16:48:48','2025-11-10 19:10:45',0),(10,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Club Sur','Av. Rivadavia 5678, CABA',-34.61180000,-58.39600000,'[]',NULL,'[\"Futbol 5\", \"Basquet\", \"Padel\"]',7500.00,4.80,0,1,'2025-11-06 16:48:48','2025-11-10 19:10:45',0),(11,1,'norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Cancha Norte 2','Av. Cabildo 2468, CABA',-34.56780000,-58.45670000,'[]',NULL,'[\"Futbol 5\"]',6000.00,4.20,0,1,'2025-11-06 16:48:48','2025-11-10 19:10:45',0),(12,2,'sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW','Polideportivo Sur','Av. San Juan 1357, CABA',-34.62340000,-58.38900000,'[]',NULL,'[\"Basquet\", \"Voley\"]',8000.00,4.70,0,1,'2025-11-06 16:48:48','2025-11-10 19:10:45',0),(13,15,'X','$2b$12$2AXAqPGxRdOaEbveNfSCNeDt4oCvyotqTV9WStCQUXj3kCEwriQMq','X','X',NULL,NULL,'[]','','[\"\"]',0.00,0.00,0,1,'2025-11-06 18:07:28','2025-11-10 17:58:31',0),(14,16,'ALAVEZla','$2b$12$y24xFDnA8xuebY5aNhHLOeCoksJwZNiHto4LPAaqCu/9n6GKBiGom','hola','hola',NULL,NULL,'[]','','[\"\"]',0.00,0.00,0,1,'2025-11-07 12:27:21','2025-11-10 17:58:31',0),(15,17,'FACUNDO','$2b$12$6/T14gLgMb9q4Ph5Viv3ve2ZWo/J2JnYgrDgYA5gUo7ORWdR2iXK.','POLI','LAUTARO',NULL,NULL,'[]','','[\"Voley\"]',1000.00,0.00,0,1,'2025-11-07 16:48:25','2025-11-10 20:03:34',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
INSERT INTO `sesiones` VALUES (5,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjQ0NjU4MywiZXhwIjoxNzY1MDM4NTgzfQ.gv3UeUcRyoN8ScbwTU2RZwHTW_FzdmkvC1d5vTQJ7p8','usuario','2025-12-06 16:29:43','2025-11-06 16:29:43'),(7,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjQ0ODU5MiwiZXhwIjoxNzY1MDQwNTkyfQ.mCAys-ok_TDliafSFVltjaMV1N38jZoW8ngIrV2rR0w','usuario','2025-12-06 17:03:13','2025-11-06 17:03:12'),(14,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjUyMDM4MSwiZXhwIjoxNzY1MTEyMzgxfQ.EY9lvoM-PE6sKRHZnM5KUuFxAkRX2sGwfHYSNShV7YI','usuario','2025-12-07 12:59:41','2025-11-07 12:59:41'),(15,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjUyMzM5NiwiZXhwIjoxNzY1MTE1Mzk2fQ.PPPxpJz58O9orc_ifiZC2CyavRer-H7GVvTWMa4oa-Y','usuario','2025-12-07 13:49:56','2025-11-07 13:49:56'),(20,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzgyNDY0LCJleHAiOjE3NjUzNzQ0NjR9.x6T8rASOUzv-spt_pa8d3dHF0LZL2xHkf4fNqLNIybA','local','2025-12-10 13:47:45','2025-11-10 13:47:44'),(21,18,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImVtYWlsIjoiQlJVTk9QRUxPVEEiLCJ0aXBvX3VzdWFyaW8iOiJ1c3VhcmlvIiwibm9tYnJlX2NvbXBsZXRvIjoiQlJVTk8iLCJpYXQiOjE3NjI3ODI1ODQsImV4cCI6MTc2NTM3NDU4NH0.SLTpi6QbXQxUqr1JoaU69duU3kfncTDtVFeeX9d5Q14','usuario','2025-12-10 13:49:45','2025-11-10 13:49:44'),(22,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzgzMDUxLCJleHAiOjE3NjUzNzUwNTF9.MBD3xqFl4ukS7SkXSYXaou2pEpr4oyvKrBWemczUsks','local','2025-12-10 13:57:32','2025-11-10 13:57:31'),(23,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzkyOTMxLCJleHAiOjE3NjUzODQ5MzF9.EC9wI5sfp4gFRKZ8UqZQaChU3uR9eLt4A7qCDOutkbQ','local','2025-12-10 16:42:12','2025-11-10 16:42:11'),(24,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzkzNDM4LCJleHAiOjE3NjUzODU0Mzh9.OIR1DNC2LP4vGE2JK6xFuF7AKpUkwGIBUKy39zbWmQI','local','2025-12-10 16:50:39','2025-11-10 16:50:38'),(25,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzkzNDg5LCJleHAiOjE3NjUzODU0ODl9.L_QNNQogESjV5iPW7B2cIjmLCGICK8J2UdkymCGZF-4','local','2025-12-10 16:51:29','2025-11-10 16:51:29'),(26,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2Mjc5MzU0MiwiZXhwIjoxNzY1Mzg1NTQyfQ.RMbrxqQhcyUoeDDZd_OmWKFoRvm5V2pO4g-6uSe3u5M','usuario','2025-12-10 16:52:23','2025-11-10 16:52:22'),(27,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzkzNTc5LCJleHAiOjE3NjUzODU1Nzl9.UA3dbVGBMuYIS3_RFjPX4kz9JL5n-BlSEbe0MHJHJjo','local','2025-12-10 16:52:59','2025-11-10 16:52:59'),(28,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk1OTk5LCJleHAiOjE3NjUzODc5OTl9.NrHFU2m8o37lvGTTF4enWpIRIU-EjhfuKlihOwDsFyU','local','2025-12-10 17:33:20','2025-11-10 17:33:19'),(29,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk2NjA4LCJleHAiOjE3NjUzODg2MDh9.hPt10v4y-QRboqmek-329xNSVrrTqaz5AQLE2fuyWRY','local','2025-12-10 17:43:29','2025-11-10 17:43:28'),(30,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk2NjQxLCJleHAiOjE3NjUzODg2NDF9.6NQU7wkS7dl1csA7JqHdb5TGqqAA8Sjxr7jhsm9xcgw','local','2025-12-10 17:44:01','2025-11-10 17:44:01'),(31,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk2Njg0LCJleHAiOjE3NjUzODg2ODR9.AS_XHP7M1hmkgdp1K_4nWbczzJMi_1V0X6ZGQUH7LY0','local','2025-12-10 17:44:44','2025-11-10 17:44:44'),(32,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2Mjc5NjcyNiwiZXhwIjoxNzY1Mzg4NzI2fQ.SQ1k1t_m7wmoUXxe6xdIF3zfF8JQVsGtABAVl7RDF5Q','usuario','2025-12-10 17:45:27','2025-11-10 17:45:26'),(33,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk2NzUxLCJleHAiOjE3NjUzODg3NTF9.6AiWmefGadwiqghDPaypNuZ9hN0WVmq2o6DlWLFq4L4','local','2025-12-10 17:45:51','2025-11-10 17:45:51'),(34,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk2ODAzLCJleHAiOjE3NjUzODg4MDN9.cevE0EYp1NTdsTekzFglfpcWhBhZaoC9-4T6uFMohPA','local','2025-12-10 17:46:43','2025-11-10 17:46:43'),(35,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk3NTU2LCJleHAiOjE3NjUzODk1NTZ9.1XNH3n2hHBNS3SOY02GRQJvf-Zkv8QveYLPRZMoAv6M','local','2025-12-10 17:59:16','2025-11-10 17:59:16'),(36,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyNzk4MjkyLCJleHAiOjE3NjUzOTAyOTJ9.XqSBrDku-bLHqZkorj2VzbsUC-C2IML5RchVnd8rTdg','local','2025-12-10 18:11:32','2025-11-10 18:11:32'),(37,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODAwMjA2LCJleHAiOjE3NjUzOTIyMDZ9.jx5IZaH5480lUPYS6SlIWF8moicoHQ_q7w48jwj_Nuk','local','2025-12-10 18:43:27','2025-11-10 18:43:26'),(38,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODAwMzg4LCJleHAiOjE3NjUzOTIzODh9.SlwE_QEjtgFIUd3UNW8oUQyFOR36jPns7z-dQc_UIEE','local','2025-12-10 18:46:29','2025-11-10 18:46:28'),(39,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjgwMDQwNSwiZXhwIjoxNzY1MzkyNDA1fQ._HoH4vdNvIaZanHz_kQiAZoGoJ8cNbQlvdY5jjC1kiE','usuario','2025-12-10 18:46:45','2025-11-10 18:46:45'),(40,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODAwNDUyLCJleHAiOjE3NjUzOTI0NTJ9.NQIGP-3cojxz-vHNJh81UwNmUXg8n-O0Okykji3gIOo','local','2025-12-10 18:47:33','2025-11-10 18:47:32'),(41,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiQUxBVkVaIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsIm5vbWJyZV9jb21wbGV0byI6IkVZIiwibG9jYWxfaWQiOm51bGwsImlhdCI6MTc2MjgwMjA0NiwiZXhwIjoxNzY1Mzk0MDQ2fQ.sHiBG1kmxMgTcuCg_TNappD5W4UEF6qOFocFohL5_yg','usuario','2025-12-10 19:14:07','2025-11-10 19:14:06'),(42,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODAyMDgyLCJleHAiOjE3NjUzOTQwODJ9.6UaAQgU0sHmDu-6H9w0JrPWYvaZPQsI6FMLUHxyg008','local','2025-12-10 19:14:42','2025-11-10 19:14:42'),(43,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODAzMjU4LCJleHAiOjE3NjUzOTUyNTh9.ECVGyKxAXtoRtvlpMJ4S6lOMh-Tb0lke7qnJWPIFNWE','local','2025-12-10 19:34:18','2025-11-10 19:34:18'),(44,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODAzMzQ1LCJleHAiOjE3NjUzOTUzNDV9.rJrEaOjBWi_Kk8WYG8DNxFUWw5ADT_99ZhUbipIC5wk','local','2025-12-10 19:35:45','2025-11-10 19:35:45'),(45,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODA0OTU0LCJleHAiOjE3NjUzOTY5NTR9.ePtLeLCY1RFgTbLmL1zgGoqv1ePugiw_rKRdVDTEd7s','local','2025-12-10 20:02:35','2025-11-10 20:02:34'),(46,17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoiRkFDVU5ETyIsInRpcG9fdXN1YXJpbyI6ImxvY2FsIiwibm9tYnJlX2NvbXBsZXRvIjoiRmFjdW5kbyBIb3VzZSIsImxvY2FsX2lkIjoxNSwiaWF0IjoxNzYyODA0OTk4LCJleHAiOjE3NjUzOTY5OTh9.SEXWY-08vqQ7OeRNeIfSsEx6c40SnHrmQWVcS8dSL2g','local','2025-12-10 20:03:19','2025-11-10 20:03:18');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Club Deportivo Norte','norte@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW',NULL,'local',NULL,NULL,'2025-11-06 12:21:07','2025-11-06 12:21:07'),(2,'Club Sur','sur@clubes.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW',NULL,'local',NULL,NULL,'2025-11-06 12:21:07','2025-11-06 12:21:07'),(3,'Juan Pérez','juan@email.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW',NULL,'usuario',NULL,NULL,'2025-11-06 12:21:07','2025-11-06 12:21:07'),(7,'i','1','$2b$12$Me/j2yhX5LH3jgypWRNLT.3N7WXccFBFfr1HNlFjy3EJLp.tQbXhe','1','usuario',NULL,NULL,'2025-11-06 13:11:37','2025-11-06 13:11:37'),(8,'d','f@gmail.com','$2b$12$Pgjf3XWQBA5L/74CaagiwOqlyYgFjjDk2nXdACftVZ.OLgWSiHleW','2006','usuario',NULL,NULL,'2025-11-06 14:13:27','2025-11-06 14:13:27'),(9,'EXOTICA','MIAMI','$2b$12$oZX4BdDJ7ywO/36Vae7EvO80nxe6BJg/Fr/lNfEB8/c40d0WicBYe','1999','usuario',NULL,NULL,'2025-11-06 16:25:52','2025-11-06 16:25:52'),(10,'EY','ALAVEZ','$2b$12$SBYEkaJ7N18FBX67jBVMQ.bT/JqCdu6ybVFkF78YJiFkyNduA7Ir6','1999','usuario','/uploads/profiles/profile-1762448578782-95271117.jpg',NULL,'2025-11-06 16:29:18','2025-11-06 17:02:58'),(14,'LAL','LAL','$2b$12$Xudh3lsBLTv25x1qcLIKdO/ABmWECtObOIrpgA7MW0vs6q8kptpQ6',NULL,'local',NULL,NULL,'2025-11-06 17:51:31','2025-11-06 17:51:31'),(15,'X','X','$2b$12$2AXAqPGxRdOaEbveNfSCNeDt4oCvyotqTV9WStCQUXj3kCEwriQMq',NULL,'local',NULL,NULL,'2025-11-06 18:07:28','2025-11-06 18:07:28'),(16,'hola','ALAVEZla','$2b$12$y24xFDnA8xuebY5aNhHLOeCoksJwZNiHto4LPAaqCu/9n6GKBiGom',NULL,'local',NULL,NULL,'2025-11-07 12:27:21','2025-11-07 12:27:21'),(17,'Facundo House','FACUNDO','$2b$12$6/T14gLgMb9q4Ph5Viv3ve2ZWo/J2JnYgrDgYA5gUo7ORWdR2iXK.',NULL,'local',NULL,NULL,'2025-11-07 16:48:25','2025-11-07 16:48:25'),(18,'BRUNO','BRUNOPELOTA','$2b$12$tm6dW2kVbD1VJVHyIoDlsuGZF5GRTYr.IgaYujACUBBvlNmLU766O','2006','usuario',NULL,NULL,'2025-11-10 13:49:44','2025-11-10 13:49:44');
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

-- Dump completed on 2025-11-10 17:18:03
