import spacy


class NLPParser:

    def __init__(self):

        try:
            self.nlp = spacy.load("en_core_web_sm")

        except:
            import os
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")

    def parse(self, text):

        text = text.lower()

        doc = self.nlp(text)

        intent = "general"

        if "crowd" in text or "zone" in text or "density" in text:
            intent = "density"

        elif "predict" in text or "future" in text or "forecast" in text:
            intent = "prediction"

        elif "guards" in text or "security" in text or "staff" in text:
            intent = "security"

        return {
            "intent": intent,
            "tokens": [token.text for token in doc]
        }