import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/api/category.api";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAll();
      return res.data.data;
    },
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await categoryApi.create(data);
      return res.data.data;
    },

    onSuccess: (newCategory) => {
      qc.setQueryData(["categories"], (old = []) => [...old, newCategory]);
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await categoryApi.update(id, data);
      return res.data.data;
    },

    onSuccess: (updatedCategory) => {
      qc.setQueryData(["categories"], (old = []) =>
        old.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat,
        ),
      );
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await categoryApi.delete(id);
      return id;
    },

    onSuccess: (deletedId) => {
      qc.setQueryData(["categories"], (old = []) =>
        old.filter((cat) => cat._id !== deletedId),
      );
    },
  });
};
