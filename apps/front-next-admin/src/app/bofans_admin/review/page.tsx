"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { PhotoCategoryDto, ReviewPhotoDto } from "@mono/types";
import type { CategorySystem } from "@mono/types";
import { getCategories, createCategory } from "@/api/bofans/category"; // 需要添加分类API

const REVIEW_PAGE_SIZE = 20;

// 扩展Photo类型，添加分类名称
interface PhotoWithCategory extends ReviewPhotoDto {
  categoryName?: string;
}

// 分类信息接口
type CategoryInfo = PhotoCategoryDto;

export default function PhotoReviewPage() {
  const [photos, setPhotos] = useState<PhotoWithCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<number, CategoryInfo>>(
    {},
  );
  const [systems, setSystems] = useState<string[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<
    Record<string, CategoryInfo[]>
  >({});
  const [selectedCategories, setSelectedCategories] = useState<
    Record<number, number>
  >({});
  const [newCategory, setNewCategory] = useState({ system: "", name: "" });
  const [batchMode, setBatchMode] = useState<"current" | "new">("current");
  const [batchCategory, setBatchCategory] = useState<number | null>(null);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [batchSystem, setBatchSystem] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // 获取分类数据
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      const systems = [...new Set(data.map((c) => c.system))];
      const groups = systems.reduce(
        (acc, system) => {
          acc[system] = data.filter((c) => c.system === system);
          return acc;
        },
        {} as Record<string, CategoryInfo[]>,
      );

      setSystems(systems);
      setCategoryGroups(groups);
      setCategoryMap(data.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}));
    } catch (error) {
      console.error("获取分类数据失败:", error);
    }
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReviewList({ page, pageSize: REVIEW_PAGE_SIZE });
      setPhotos(data.items);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("获取照片列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    setSelectedIds([]);
  }, [page]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? photos.map((photo) => photo.id) : []);
    },
    [photos],
  );

  // 添加创建分类弹窗
  const handleCreateCategory = async () => {
    if (!newCategory.system || !newCategory.name) {
      alert("请填写分类信息");
      return;
    }

    try {
      await createCategory({
        system: newCategory.system as CategorySystem,
        systemName:
          categoryGroups[newCategory.system]?.[0]?.systemName ||
          newCategory.system,
        name: newCategory.name,
      });
      await fetchCategories();
      setNewCategory({ system: "", name: "" });
      setCategoryDialogOpen(false);
      toast.success("创建分类成功");
    } catch (error) {
      console.error("创建分类失败:", error);
      toast.error(`创建分类失败${error}`);
    }
  };

  const handleSelectOne = useCallback((checked: boolean, id: number) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  }, []);

  const handleBatchApprove = async () => {
    const photosToApprove = selectedIds
      .map((id) => {
        // 处理当前分类模式
        if (batchMode === "current") {
          const categoryId =
            selectedCategories[id] ||
            photos.find((p) => p.id === id)?.categoryId;
          return categoryId ? { id, categoryId } : null;
        }
        // 处理新分类模式
        if (batchCategory) {
          return { id, categoryId: batchCategory };
        }
        return null;
      })
      .filter((p) => p !== null) as { id: number; categoryId: number }[];

    if (photosToApprove.length === 0) return;

    try {
      setLoading(true);
      await batchReviewPass(photosToApprove);
      setSelectedIds([]);
      setIsBatchDialogOpen(false);
      await fetchPhotos();
    } catch (error) {
      console.error("批量通过失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setIsBatchDialogOpen(true); // 打开批量审核弹窗
  }, [selectedIds]);

  const handleReject = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setLoading(true);
      await batchReviewReject(selectedIds);
      setSelectedIds([]);
      await fetchPhotos();
    } catch (error) {
      console.error("批量拒绝失败:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedIds, fetchPhotos]);

  // 添加单行操作函数
  const handleSingleApprove = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const categoryId =
          selectedCategories[id] || photos.find((p) => p.id === id)?.categoryId;

        if (!categoryId) {
          alert("请先选择分类");
          return;
        }

        await batchReviewPass([{ id, categoryId }]);
        await fetchPhotos();
      } catch (error) {
        console.error("通过失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchPhotos, selectedCategories, photos],
  );

  const handleSingleReject = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        await batchReviewReject([id]);
        await fetchPhotos();
      } catch (error) {
        console.error("拒绝失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchPhotos],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>图片审核</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={selectedIds.length === 0 || loading}
            >
              批量通过
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={selectedIds.length === 0 || loading}
            >
              批量拒绝
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            待审核 {total} 张，当前第 {page} 页
          </div>
          <Dialog
            open={categoryDialogOpen}
            onOpenChange={setCategoryDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="ml-4">新建二级分类</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建二级分类</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>一级分类</Label>
                  <Select
                    onValueChange={(v) =>
                      setNewCategory((p) => ({ ...p, system: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择一级分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {systems.map((system) => (
                        <SelectItem key={system} value={system}>
                          {system}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>二级分类名称</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCategory}>创建</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.length === photos.length && photos.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead>预览</TableHead>
                <TableHead>一级分类</TableHead>
                <TableHead>二级分类</TableHead>
                <TableHead>上传者</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {photos.map((photo) => {
                const currentCategory =
                  categoryMap[selectedCategories[photo.id] || photo.categoryId];

                return (
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
                        loading="lazy"
                        className="h-20 w-20 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentCategory?.system || ""}
                        onValueChange={(system) =>
                          setSelectedCategories((prev) => ({
                            ...prev,
                            [photo.id]: categoryGroups[system]?.[0]?.id || 0,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择一级分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {systems.map((system) => (
                            <SelectItem key={system} value={system}>
                              {system}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentCategory?.id?.toString() || ""}
                        onValueChange={(id) =>
                          setSelectedCategories((prev) => ({
                            ...prev,
                            [photo.id]: parseInt(id),
                          }))
                        }
                        disabled={!currentCategory?.system}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择二级分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentCategory?.system &&
                            categoryGroups[currentCategory.system]?.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{photo.authorOpenId}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSingleApprove(photo.id)}
                          disabled={loading}
                        >
                          通过
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleSingleReject(photo.id)}
                          disabled={loading}
                        >
                          拒绝
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {photos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {loading ? "加载中..." : "暂无待审核的图片"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            上一页
          </Button>
          <div className="text-sm text-muted-foreground">
            本页 {photos.length} 张
          </div>
          <Button
            variant="outline"
            disabled={!hasMore || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            下一页
          </Button>
        </div>
      </CardContent>

      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量审核设置</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <RadioGroup
              value={batchMode}
              onValueChange={(v) => setBatchMode(v as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="r1" />
                <Label htmlFor="r1">使用当前分类</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="r2" />
                <Label htmlFor="r2">统一修改分类</Label>
              </div>
            </RadioGroup>

            {batchMode === "new" && (
              <div className="grid gap-4">
                <Select onValueChange={(system) => setBatchSystem(system)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一级分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={batchCategory?.toString() || ""}
                  onValueChange={(v) => setBatchCategory(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择二级分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {batchSystem &&
                      categoryGroups[batchSystem]?.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleBatchApprove}>确认通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
