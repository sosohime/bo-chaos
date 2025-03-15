--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Debian 15.10-0+deb12u1)
-- Dumped by pg_dump version 15.10 (Debian 15.10-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: bofans
--

COPY public."User" ("openId", "sessionKey", nickname, "avatarUrl", "lastKowtowTime", "kowtowCount", "joinTime", "photoReviewer") FROM stdin;
o-IL468LzZ-EaWJMNXoIXB43Denw	\N	博粉1741488561817	\N	\N	0	2025-03-09 02:49:21.817	f
o-IL467oynQ4sCRXHrM_n3OfL2F4	\N	博粉1740216796193	\N	2025-03-03 07:29:41.972	1	2025-02-22 09:33:16.194	f
o-IL463P7IIIrTgZlAvfpPH7FiC8	\N	博粉1740132283478	\N	2025-03-03 07:29:50.938	3	2025-02-21 10:04:43.478	f
o-IL4683cUeHf7FwCTScB85IygjE	\N	博粉1740992687045	\N	\N	0	2025-03-03 09:04:47.046	f
o-IL461nbWBesCmGF3dkas9sEXlc	\N	博粉1740136804350	\N	\N	0	2025-02-21 11:20:04.35	f
o-IL466M62r3YvVqtW05CmYYDXO8	\N	桃花	https://zhangyiming.online/bofans_static/avatars/avatao-IL466M62r3YvVqtW05CmYYDXO8_1741333012659.jpg	2025-03-13 04:20:20.173	100	2025-03-07 07:35:36.31	f
o-IL46zKY2VbbDiZY1BL_G7sedPs	\N	博粉1740138895721	\N	2025-02-21 11:54:59.324	1	2025-02-21 11:54:55.722	f
o-IL460kK0bytnc-n67aEZjK4QwU	\N	博粉1741677467602	\N	2025-03-11 07:18:02.168	42	2025-03-11 07:17:47.602	f
o-IL463Om8A4kzEnADbNZTDTpvLY	\N	博粉1740138895731	\N	2025-02-21 12:13:45.914	2	2025-02-21 11:54:55.732	f
o-IL46_GI-foOw00CVAaBltP11GY	\N	博粉1740140021542	\N	2025-02-21 12:13:53.781	1	2025-02-21 12:13:41.542	f
o-IL465DISC0rA6t5puCGeRA3yJ0	\N	博粉1741832202184	\N	2025-03-14 04:22:37.172	335	2025-03-13 02:16:42.184	f
o-IL46-Veu_6ZRWiMg3ThzQqNqnA	\N	博粉1741758074769	\N	2025-03-12 05:41:20.806	20	2025-03-12 05:41:14.77	f
o-IL466UiEJQGovC0H65QEX1hDjw	\N	博粉1741593307445	\N	2025-03-10 07:55:12.094	12	2025-03-10 07:55:07.446	f
o-IL46wjWLPCDC8wXScXMl4F-hcE	\N	Avin	\N	2025-03-14 01:46:25.726	324	2025-03-03 09:35:26.771	f
o-IL46_sRxWY3u9l7V_PJETkiblw	\N	博粉1741593302262	\N	2025-03-10 07:55:12.378	52	2025-03-10 07:55:02.263	f
o-IL4696FNH15fWIgSh1PpV5PYOI	\N	博粉1740489527141	\N	2025-02-27 09:06:43.553	48	2025-02-25 13:18:47.142	f
o-IL468Amrn0j-9M2aHoAN46Obq4	\N	博粉1739438414362	\N	2025-02-13 09:24:49.529	4	2025-02-13 09:20:14.363	f
o-IL46yfJOdXC6OmKT9Xj-ZUO-RU	\N	博粉1741926291545	\N	2025-03-14 04:24:52.587	1	2025-03-14 04:24:51.546	f
o-IL46-BUXDzWWAsD4SLu8CVdqrE	\N	博粉1740280066036	\N	\N	0	2025-02-23 03:07:46.037	f
o-IL468tVscaNIZz0laZsgdrEx6U	\N	博粉1740489977833	\N	2025-02-25 13:26:30.356	58	2025-02-25 13:26:17.834	f
o-IL46wOuX03yYFvJrLpIKFb4naU	\N	博粉1740386641267	\N	\N	0	2025-02-24 08:44:01.268	f
o-IL462Tg2BYOcQYo0lOecdOAO6Q	\N	博粉1740398337803	\N	\N	0	2025-02-24 11:58:57.804	f
o-IL46wPhkIm5mOogwVkxlFw_Fuo	\N	博粉1740992687059	\N	2025-03-11 10:37:24.939	1	2025-03-03 09:04:47.06	f
o-IL4626OiDlv_IZKq58wcSkkO2w	\N	博粉1741593200498	\N	2025-03-11 07:12:14.43	24	2025-03-10 07:53:20.499	f
o-IL460CrSM8gS7kK7oZz_twf92c	\N	博粉1740132283500	\N	2025-03-11 10:37:33.788	5	2025-02-21 10:04:43.501	f
o-IL465ApzklNRsD7_ymX0jQCjVU	\N	大灰猹	\N	2025-03-14 01:53:26.734	169	2025-03-10 07:59:26.72	f
o-IL46zm4hSgEFnWh_Ke9XfPe6xQ	\N	博粉1741593339745	\N	2025-03-10 07:55:43.803	10	2025-03-10 07:55:39.746	f
o-IL4686ZnvuEMKo4rTmwUYOtOuI	\N	博粉1741434112051	\N	\N	0	2025-03-08 11:41:52.052	f
o-IL461Q-T87IbMwCkRkjJf3fa5g	\N	博粉1740720608096	\N	\N	0	2025-02-28 05:30:08.097	f
o-IL467lF9udQm-6d6GsqgQ5wGPg	\N	博粉1741071858733	\N	\N	0	2025-03-04 07:04:18.734	f
o-IL46yJguNWgt6HM6gZGLnel3a0	\N	博粉1741593223261	\N	2025-03-10 07:53:50.426	24	2025-03-10 07:53:43.262	f
o-IL462F7pY2OGtPrjWPRYwRf6Zw	\N	Lousama	\N	2025-03-10 08:33:07.702	2	2025-03-10 08:33:05.902	f
o-IL465LhuxG902azD62SgQjVbS8	\N	博粉1741689441391	\N	2025-03-11 10:37:33.878	1	2025-03-11 10:37:21.392	f
o-IL469h_5KNHIqCuPKpri9zrmZU	\N	顾北	\N	2025-03-08 17:36:03.902	58	2025-02-25 13:25:06.571	f
o-IL468EcqZ5ABokrIvX1h43E5CQ	\N	博粉1741696087013	\N	\N	0	2025-03-11 12:28:07.014	f
o-IL46wZ2KtbPFvynCsgJX08-C48	\N	博粉1741832588811	\N	2025-03-13 02:23:52.695	20	2025-03-13 02:23:08.812	f
o-IL46zQjpSbtPXFq-3BV8H2NxqY	\N	博粉1740489558064	\N	2025-03-14 04:32:06.179	634	2025-02-25 13:19:18.065	f
o-IL464rHUJ6AvzbPm4jGbWKTNiY	\N	博粉1739438654225	\N	2025-03-14 04:25:54.114	45	2025-02-13 09:24:14.225	f
o-IL466Ma-FMt63a70SourViYSO0	\N	博粉1740489533205	\N	2025-02-27 07:45:57.069	198	2025-02-25 13:18:53.206	f
o-IL4688V38XRPBQg8KxPfFtTxzU	\N	博粉1741593699340	\N	2025-03-10 08:01:44.024	21	2025-03-10 08:01:39.341	f
o-IL463QjTvHIe26x9bH07BKwNJs	\N	博粉1741928909780	\N	2025-03-14 05:08:37.043	13	2025-03-14 05:08:29.781	f
o-IL465v--wQiF3dqZ3ATn8yEk5A	\N	博粉1739438589294	\N	2025-03-13 02:42:29.251	99	2025-02-13 09:23:09.294	f
o-IL464_Jp7pEAvJ-DfYA1LQ2JHU	\N	博粉1742022491958	\N	2025-03-15 07:08:38.842	20	2025-03-15 07:08:11.959	f
o-IL468mxspou5ZvoSU3703bZP18	\N	博粉1741593462379	\N	2025-03-13 03:06:07.167	3	2025-03-10 07:57:42.379	f
o-IL460mRrfAwo_FHpyMF-DYp9yo	\N	博粉1741757986515	\N	2025-03-12 05:41:06.096	17	2025-03-12 05:39:46.515	f
o-IL46xPxTapeqCwfSPZVKXkDOas	\N	博粉1741759749497	\N	2025-03-12 06:11:15.745	42	2025-03-12 06:09:09.498	f
o-IL463-Vb4Ifu5b33GoqnBVoS2w	\N	博粉1740487284456	\N	2025-03-15 05:37:43.747	378	2025-02-25 12:41:24.457	f
o-IL469jAaATG9i-Kg5kSWCA-xD8	\N	博粉1741926489110	\N	2025-03-14 04:28:23.917	33	2025-03-14 04:28:09.111	f
o-IL466a3LCFx7IIh3_BcdfwIqVw	\N	博粉1741832319979	\N	\N	0	2025-03-13 02:18:39.98	f
o-IL464zzf3rVFbm7VIHnpaZYxgc	\N	博粉1741593958236	\N	2025-03-14 04:52:58.213	19	2025-03-10 08:05:58.237	f
o-IL4614TezXhDDz6fXO9vBN1rBo	\N	博粉1742018392889	\N	2025-03-15 05:59:59.753	16	2025-03-15 05:59:52.89	f
\.


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bofans
--

SELECT pg_catalog.setval('public."User_id_seq"', 53, true);


--
-- PostgreSQL database dump complete
--

