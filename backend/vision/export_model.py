import shutil
from pathlib import Path

from ultralytics import YOLO


def export_yolo26n_onnx() -> None:
    target = Path(__file__).resolve().parent.parent / "models" / "yolo26n.onnx"
    target.parent.mkdir(parents=True, exist_ok=True)

    model = YOLO("yolo26n.pt")
    exported_path = Path(model.export(format="onnx", imgsz=640, opset=17))
    shutil.move(str(exported_path), str(target))
    print(f"Exported lightweight YOLO26n ONNX model to: {target}")


if __name__ == "__main__":
    export_yolo26n_onnx()
