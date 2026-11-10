import sys
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from db.database import SessionLocal, Base, engine
import models.user
import models.subject
from schemas.subject import (
    AsignaturaCreate,
    EvaluacionCreate,
    CalculadoraItem,
    CalculadoraRequest,
    AsignaturaUpdate,
    EvaluacionUpdate,
)
from schemas.user import UserCreate
from crud.user import create_user, get_user_by_email
from crud.subject import (
    create_subject,
    get_user_subjects,
    get_subject_by_id,
    update_subject,
    delete_subject,
    create_evaluation,
    update_evaluation,
    delete_evaluation,
    calcular_estadisticas_evaluaciones,
    calcular_cortes_asignatura,
    calcular_calculadora_rapida,
)

def run():
    print("[TEST] Inicializando tablas...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Test Calculadora Rapida
        print("\n--- 1. Test Calculadora Rapida (Widget Instantaneo) ---")
        items = [
            CalculadoraItem(nombre="Parcial 1", nota=7.5, peso_porcentaje=30.0),
            CalculadoraItem(nombre="Parcial 2", nota=8.0, peso_porcentaje=30.0),
            CalculadoraItem(nombre="Trabajo", nota=None, peso_porcentaje=40.0),
        ]
        calc_res = calcular_calculadora_rapida(items=items, escala_maxima=10.0, nota_aprobatoria=6.0)
        print("[OK] Calculadora Rapida Resuelta:")
        print("     Promedio Ponderado Calificado:", calc_res.promedio_ponderado)
        print("     Porcentaje Evaluado:", calc_res.porcentaje_evaluado)
        print("     Porcentaje Restante:", calc_res.porcentaje_restante)
        print("     Nota Acumulada Actual:", calc_res.nota_acumulada)
        print("     Nota Necesaria en Restante:", calc_res.nota_necesaria_para_aprobar)
        print("     Estado:", calc_res.estado)
        print("     Diagnostico:", calc_res.mensaje_diagnostico)

        assert calc_res.porcentaje_evaluado == 60.0
        assert calc_res.porcentaje_restante == 40.0
        assert calc_res.nota_acumulada == 4.65
        assert abs(calc_res.nota_necesaria_para_aprobar - 3.38) <= 0.02
        assert calc_res.es_alcanzable is True

        # 2. Crear o recuperar usuario de prueba
        print("\n--- 2. Usuario de Prueba ---")
        email_test = "andrea.gomez@dalat.edu"
        user = get_user_by_email(db, email=email_test)
        if not user:
            user = create_user(
                db,
                UserCreate(
                    nombre="Andrea Gomez",
                    email=email_test,
                    password="Password123!",
                    carrera="Ingenieria de Sistemas",
                    universidad="Universidad Central",
                    semestre="6to Semestre",
                    avatar_color="#7c5dfa"
                )
            )
        print(f"[OK] Usuario ID: {user.id_usuario}, Nombre: {user.nombre}")

        # 3. Crear Asignatura con evaluaciones iniciales
        print("\n--- 3. Crear Asignatura con Evaluaciones Iniciales ---")
        subj_in = AsignaturaCreate(
            nombre="Calculo Multivariable",
            codigo="MAT-201",
            profesor="Dr. Martinez",
            creditos=4,
            color="#7c5dfa",
            icono="calculator",
            periodo="2026-1",
            escala_maxima=5.0,
            nota_aprobatoria=3.0,
            evaluaciones_iniciales=[
                EvaluacionCreate(
                    nombre="Parcial 1",
                    tipo="Parcial",
                    corte=1,
                    nota=4.2,
                    peso_porcentaje=30.0
                ),
                EvaluacionCreate(
                    nombre="Taller Optimizacion",
                    tipo="Taller",
                    corte=1,
                    nota=4.5,
                    peso_porcentaje=10.0
                )
            ]
        )
        subj = create_subject(db, subject_in=subj_in, user_id=user.id_usuario)
        print(f"[OK] Asignatura Creada: ID {subj.id_asignatura}, Nombre: '{subj.nombre}'")
        assert len(subj.evaluaciones) == 2

        # 4. Estadisticas calculadas
        print("\n--- 4. Estadisticas Iniciales ---")
        stats = calcular_estadisticas_evaluaciones(
            subj.evaluaciones,
            escala_maxima=subj.escala_maxima,
            nota_aprobatoria=subj.nota_aprobatoria
        )
        print("     Promedio Actual:", stats.promedio_actual)
        print("     Evaluado %:", stats.porcentaje_evaluado)
        print("     Restante %:", stats.porcentaje_restante)
        print("     Acumulado:", stats.nota_acumulada)
        print("     Necesario en restante:", stats.nota_necesaria_para_aprobar)
        print("     Diagnostico:", stats.mensaje_diagnostico)
        assert stats.porcentaje_evaluado == 40.0
        assert stats.nota_acumulada == 1.71
        # Faltan 3.0 - 1.71 = 1.29 sobre el 60% restante -> 1.29 / 0.60 = 2.15
        assert stats.nota_necesaria_para_aprobar == 2.15
        assert stats.es_alcanzable is True

        # 5. Agrupacion por Cortes
        print("\n--- 5. Desglose por Cortes ---")
        cortes = calcular_cortes_asignatura(subj.evaluaciones)
        print(f"[OK] Total Cortes: {len(cortes)}")
        for c in cortes:
            print(f"     Corte {c.corte}: Promedio={c.promedio}, % Total={c.porcentaje_total}, Evaluaciones={len(c.evaluaciones)}")

        # 6. Agregar Evaluacion al Corte 2
        print("\n--- 6. Agregar Evaluacion al Corte 2 ---")
        eval2 = create_evaluation(
            db,
            subject_id=subj.id_asignatura,
            eval_in=EvaluacionCreate(
                nombre="Parcial 2",
                tipo="Parcial",
                corte=2,
                nota=3.8,
                peso_porcentaje=30.0
            )
        )
        print(f"[OK] Evaluacion 2 Creada: ID {eval2.id_evaluacion}, Nota: {eval2.nota}")

        # 7. Agregar Evaluacion al Corte 3 (Pendiente de calificar)
        print("\n--- 7. Agregar Evaluacion Pendiente al Corte 3 ---")
        eval3 = create_evaluation(
            db,
            subject_id=subj.id_asignatura,
            eval_in=EvaluacionCreate(
                nombre="Examen Final",
                tipo="Examen",
                corte=3,
                nota=None,
                peso_porcentaje=30.0
            )
        )
        print(f"[OK] Evaluacion 3 Creada: ID {eval3.id_evaluacion}, Nota: {eval3.nota} (Pendiente)")

        # 8. Recalcular con 70% Evaluado
        print("\n--- 8. Recalcular Estadisticas con 70% Evaluado ---")
        subj_actualizada = get_subject_by_id(db, subject_id=subj.id_asignatura, user_id=user.id_usuario)
        stats2 = calcular_estadisticas_evaluaciones(
            subj_actualizada.evaluaciones,
            escala_maxima=subj_actualizada.escala_maxima,
            nota_aprobatoria=subj_actualizada.nota_aprobatoria
        )
        print("     Promedio Actual:", stats2.promedio_actual)
        print("     Evaluado %:", stats2.porcentaje_evaluado)
        print("     Acumulado:", stats2.nota_acumulada)
        print("     Necesario en el 30% restante:", stats2.nota_necesaria_para_aprobar)
        print("     Diagnostico:", stats2.mensaje_diagnostico)
        assert stats2.porcentaje_evaluado == 70.0
        assert stats2.nota_acumulada == 2.85
        assert stats2.nota_necesaria_para_aprobar == 0.50

        # 9. Calificar el Examen Final y llegar al 100%
        print("\n--- 9. Calificar Examen Final ---")
        update_evaluation(db, db_eval=eval3, eval_in=EvaluacionUpdate(nota=4.5))
        subj_final = get_subject_by_id(db, subject_id=subj.id_asignatura, user_id=user.id_usuario)
        stats_final = calcular_estadisticas_evaluaciones(
            subj_final.evaluaciones,
            escala_maxima=subj_final.escala_maxima,
            nota_aprobatoria=subj_final.nota_aprobatoria
        )
        print("     Nota Definitiva:", stats_final.nota_acumulada)
        print("     Porcentaje Evaluado:", stats_final.porcentaje_evaluado)
        print("     Porcentaje Restante:", stats_final.porcentaje_restante)
        print("     Estado:", stats_final.estado_estimado)
        print("     Diagnostico:", stats_final.mensaje_diagnostico)
        # 2.85 + (4.5 * 0.3 = 1.35) = 4.20
        assert stats_final.nota_acumulada == 4.20
        assert stats_final.porcentaje_evaluado == 100.0
        assert stats_final.porcentaje_restante == 0.0
        assert stats_final.estado_estimado == "aprobada asegurada"

        print("\n[OK] Limpieza de prueba...")
        delete_subject(db, db_subject=subj_final)
        print("[OK] Asignatura de prueba eliminada.")

        print("\n=======================================================")
        print(">>> TODOS LOS TESTS DE LOGICA Y CRUD PASARON AL 100% <<<")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run()
