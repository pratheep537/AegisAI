class AllocationAgent:

    def allocate(self, zones):

        allocation = {}

        for zone,count in zones.items():

            guards = max(1, count // 20)

            allocation[zone] = guards

        return allocation