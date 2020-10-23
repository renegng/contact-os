import datetime

from chatterbot import ChatBot
from chatterbot import languages
from chatterbot.trainers import ChatterBotCorpusTrainer

# Creando una instancia de un bot de saludo
chtBot = ChatBot(
    'Contact-Bot',
    logic_adapters = [
        {
            'default_response': 'Lo siento, no le he comprendido',
            'import_path': 'chatterbot.logic.BestMatch',
            'maximum_similarity_threshold': 0.30,
            "statement_comparison_function": "chatterbot.comparisons.levenshtein_distance"
        }
    ],
    preprocessors = [
        'chatterbot.preprocessors.clean_whitespace',
        'chatterbot.preprocessors.convert_to_ascii'
    ],
    storage_adapter = 'chatterbot.storage.SQLStorageAdapter',
    database_uri = 'sqlite:///database_04oct2020_1.db',
    read_only = True,
    tagger_language = languages.SPA
)

# Entrenando la instancia del bot para saludo
trainer = ChatterBotCorpusTrainer(chtBot)
trainer.train(
    './models/chatbot_corpus/spanish/FAQ_acompanar.yml',
    './models/chatbot_corpus/spanish/FAQ_adolescentes.yml',
    './models/chatbot_corpus/spanish/FAQ_afectariaagresor.yml',
    './models/chatbot_corpus/spanish/FAQ_beneficios.yml',
    './models/chatbot_corpus/spanish/FAQ_buenasnoches.yml',
    './models/chatbot_corpus/spanish/FAQ_buenosdias.yml',
    './models/chatbot_corpus/spanish/FAQ_confidencialidad.yml',
    './models/chatbot_corpus/spanish/FAQ_covid.yml',
    './models/chatbot_corpus/spanish/FAQ_denuncia.yml',
    './models/chatbot_corpus/spanish/FAQ_edad.yml',
    './models/chatbot_corpus/spanish/FAQ_estudios.yml',
    './models/chatbot_corpus/spanish/FAQ_guarderia.yml',
    './models/chatbot_corpus/spanish/FAQ_horarios.yml',
    './models/chatbot_corpus/spanish/FAQ_horarioseducacomunitaria.yml',
    './models/chatbot_corpus/spanish/FAQ_ingresoninanino.yml',
    './models/chatbot_corpus/spanish/FAQ_inyeccion.yml',
    './models/chatbot_corpus/spanish/FAQ_llevarninos.yml',
    './models/chatbot_corpus/spanish/FAQ_madre.yml',
    './models/chatbot_corpus/spanish/FAQ_orientacionlab.yml',
    './models/chatbot_corpus/spanish/FAQ_pediatria.yml',
    './models/chatbot_corpus/spanish/FAQ_precios.yml',
    './models/chatbot_corpus/spanish/FAQ_prestamo.yml',
    './models/chatbot_corpus/spanish/FAQ_requisitosinfop.yml',
    './models/chatbot_corpus/spanish/FAQ_tiempoviolenciadomestica.yml'
)

# Ejecución del bot
hour = datetime.datetime.now().hour
minute = datetime.datetime.now().minute
seconds = datetime.datetime.now().second
day = datetime.datetime.now().day
month = datetime.datetime.now().month
year = datetime.datetime.now().year

if hour < 4:
    print('Buenas noches! Bienvenida!')
elif hour < 13:
    print('Buenos días! Bienvenida!')
elif hour < 18:
    print('Buenas tardes! Bienvenida!')
else:
    print('Buenas noches! Bienvenida!')

# Interacción en terminal
while True:
    try:
        user_input = input()

        bot_response = chtBot.get_response(user_input)

        print(bot_response)

    # Press ctrl-c or ctrl-d on the keyboard to exit
    except (KeyboardInterrupt, EOFError, SystemExit):
        break
