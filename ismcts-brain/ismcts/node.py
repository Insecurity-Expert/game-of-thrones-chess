import math

class Node:
    def __init__(self, move=None):
        self.move = move
        self.children = []
        self.visit_count = 0
        self.win_score = 0.0
        self.availability_count = 0
    
    def ucb_score(self, c=1.41):
        if self.visit_count == 0:
            return float('inf')
        exploit = self.win_score / self.visit_count
        explore = c * math.sqrt(math.log(self.availability_count) / self.visit_count)
        return exploit + explore
    
    def add_child(self, move):
        child = Node(move)
        self.children.append(child)
        return child
    
    def best_visited(self):
        return max(self.children, key=lambda c: c.visit_count)