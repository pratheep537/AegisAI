import numpy as np


class SimpleIOUTracker:
    """Fast zero-dependency IoU tracker producing stable person IDs for crowd physics."""

    def __init__(self, iou_threshold: float = 0.3, max_missed: int = 10):
        self.iou_threshold = iou_threshold
        self.max_missed = max_missed
        self._next_id = 1
        self._tracks: dict[int, dict] = {}

    @staticmethod
    def _iou(a: tuple[int, int, int, int], b: tuple[int, int, int, int]) -> float:
        x1, y1 = max(a[0], b[0]), max(a[1], b[1])
        x2, y2 = min(a[2], b[2]), min(a[3], b[3])
        inter = max(0, x2 - x1) * max(0, y2 - y1)
        if inter == 0:
            return 0.0
        area_a = max(1, (a[2] - a[0]) * (a[3] - a[1]))
        area_b = max(1, (b[2] - b[0]) * (b[3] - b[1]))
        return inter / float(area_a + area_b - inter)

    def update(
        self, boxes: list[tuple[int, int, int, int]]
    ) -> list[tuple[int, tuple[int, int, int, int]]]:
        matched_tracks: set[int] = set()
        matched_dets: set[int] = set()
        results: list[tuple[int, tuple[int, int, int, int]]] = []

        track_ids = list(self._tracks.keys())
        if track_ids and boxes:
            iou_matrix = np.zeros((len(track_ids), len(boxes)), dtype=np.float32)
            for ti, tid in enumerate(track_ids):
                tbox = self._tracks[tid]["box"]
                for di, dbox in enumerate(boxes):
                    iou_matrix[ti, di] = self._iou(tbox, dbox)

            while True:
                idx = np.unravel_index(int(np.argmax(iou_matrix)), iou_matrix.shape)
                best_iou = float(iou_matrix[idx])
                if best_iou < self.iou_threshold:
                    break
                ti, di = int(idx[0]), int(idx[1])
                tid = track_ids[ti]
                self._tracks[tid] = {"box": boxes[di], "missed": 0}
                matched_tracks.add(tid)
                matched_dets.add(di)
                results.append((tid, boxes[di]))
                iou_matrix[ti, :] = -1.0
                iou_matrix[:, di] = -1.0

        for tid in track_ids:
            if tid not in matched_tracks:
                self._tracks[tid]["missed"] += 1
                if self._tracks[tid]["missed"] > self.max_missed:
                    del self._tracks[tid]

        for di, dbox in enumerate(boxes):
            if di not in matched_dets:
                tid = self._next_id
                self._next_id += 1
                self._tracks[tid] = {"box": dbox, "missed": 0}
                results.append((tid, dbox))

        return results
