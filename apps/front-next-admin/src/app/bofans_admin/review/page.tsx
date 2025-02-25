"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getReviewList,
  batchReviewPass,
  batchReviewReject,
} from "@/api/bofans/review";
import { Photo } from "@mono/prisma-client";

export default function PhotoReviewPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReviewList();
      setPhotos(data);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? photos.map((photo) => photo.id) : []);
    },
    [photos],
  );

  const handleSelectOne = useCallback((checked: boolean, id: number) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  }, []);

  const handleApprove = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setLoading(true);
      await batchReviewPass(selectedIds);
      setSelectedIds([]);
      await fetchPhotos();
    } catch (error) {
      console.error("Failed to approve photos:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedIds, fetchPhotos]);

  const handleReject = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setLoading(true);
      await batchReviewReject(selectedIds);
      setSelectedIds([]);
      await fetchPhotos();
    } catch (error) {
      console.error("Failed to reject photos:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedIds, fetchPhotos]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>图片审核</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end space-x-2">
          <Button
            variant="default"
            onClick={handleApprove}
            disabled={selectedIds.length === 0 || loading}
          >
            通过
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={selectedIds.length === 0 || loading}
          >
            拒绝
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === photos.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead>预览</TableHead>
                <TableHead>文件名</TableHead>
                <TableHead>分类ID</TableHead>
                <TableHead>上传者</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {photos.map((photo) => (
                <TableRow key={photo.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(photo.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(!!checked, photo.id)
                      }
                      aria-label={`选择图片 ${photo.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={photo.filename}
                      alt={photo.name || "预览图"}
                      className="h-20 w-20 object-cover"
                    />
                  </TableCell>
                  <TableCell>{photo.name || photo.filename}</TableCell>
                  <TableCell>{photo.categoryId}</TableCell>
                  <TableCell>{photo.authorOpenId}</TableCell>
                </TableRow>
              ))}
              {photos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    暂无待审核的图片
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
