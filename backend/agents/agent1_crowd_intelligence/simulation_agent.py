class SimulationAgent:

    def simulate(self, people_count):

        if people_count > 50:

            reduced = people_count - 10

        else:

            reduced = people_count

        return reduced