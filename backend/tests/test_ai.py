import sys
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from db.database import SessionLocal, Base, engine
import models.user
import models.subject
import models.ai_resource
from schemas.ai_resource import GenerarRecursoRequest
from services.ai_service import AIService

def run():
    print("[TEST AI] Inicializando tablas...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Probar Generación de Examen
        print("\n--- 1. Test Generación de Examen ---")
        req_examen = GenerarRecursoRequest(
            tipo_recurso="Examen",
            materia="Cálculo III",
            tema="Unidad 3 — Integrales Múltiples",
            dificultad="Intermedio",
            cantidad=5
        )
        contenido, fuente, ms = AIService.generar_recurso_resiliente(db, req_examen)
        print(f"[OK] Fuente: {fuente}, Tiempo: {ms}ms, Preguntas: {len(contenido)}")
        assert len(contenido) == 5
        assert "opciones" in contenido[0]
        assert "indice_correcto" in contenido[0]
        print(f"Pregunta 1: {contenido[0]['pregunta']}")

        # 2. Probar Caché Instantánea
        print("\n--- 2. Test Caché Instantánea ---")
        contenido_cache, fuente_cache, ms_cache = AIService.generar_recurso_resiliente(db, req_examen)
        print(f"[OK] Fuente de segunda petición: {fuente_cache}, Tiempo: {ms_cache}ms")
        assert fuente_cache == "cache"
        assert len(contenido_cache) == 5

        # 3. Probar Generación de Flashcards
        print("\n--- 3. Test Generación de Flashcards ---")
        req_flashcards = GenerarRecursoRequest(
            tipo_recurso="Flashcards",
            materia="Microeconomía",
            tema="Elasticidad y Equilibrio",
            dificultad="Avanzado",
            cantidad=4
        )
        cards, fuente_cards, ms_cards = AIService.generar_recurso_resiliente(db, req_flashcards)
        print(f"[OK] Fuente: {fuente_cards}, Tarjetas: {len(cards)}")
        assert len(cards) == 4
        assert "anverso" in cards[0]
        assert "reverso" in cards[0]
        print(f"Card 1: {cards[0]['anverso']} -> {cards[0]['reverso'][:60]}...")

        # 4. Probar Generación de Resumen
        print("\n--- 4. Test Generación de Resumen ---")
        req_resumen = GenerarRecursoRequest(
            tipo_recurso="Resumen",
            materia="Cálculo III",
            tema="Integrales Múltiples",
            dificultad="Intermedio"
        )
        resumen, fuente_resumen, ms_resumen = AIService.generar_recurso_resiliente(db, req_resumen)
        print(f"[OK] Título: {resumen['titulo']}")
        assert "resumen_markdown" in resumen
        assert len(resumen["puntos_clave"]) > 0

        print("\n=======================================================")
        print(">>> MOTOR RESILIENTE DE RECURSOS IA FUNCIONA AL 100% <<<")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run()
