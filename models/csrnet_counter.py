import torch
import cv2
import numpy as np
from csrnet_model import CSRNet

class CSRNetCounter:

    def __init__(self):

        self.model = CSRNet()
        self.model.load_state_dict(torch.load("CSRNet_pretrained.pth"))
        self.model.eval()

    def estimate_density(self, frame):

        img = cv2.resize(frame, (640, 480))
        img = img.transpose((2,0,1))
        img = np.expand_dims(img, axis=0)

        img = torch.tensor(img).float()

        with torch.no_grad():
            density_map = self.model(img)

        count = density_map.sum().item()

        return count