from .nlp_parser import NLPParser
from .llm_response import LLMResponse


class CommandAgent:
    def __init__(self):
        self.parser = NLPParser()

        # Use lightweight model for reliability
        self.llm = LLMResponse(model="phi3")

    def process_query(self, query, system_state):

        # Parse user intent
        parsed = self.parser.parse(query)

        # Generate response using LLM + system context
        response = self.llm.generate(query, system_state)

        return response