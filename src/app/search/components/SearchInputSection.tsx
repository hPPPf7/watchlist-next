'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  關鍵字: string;
  設定關鍵字: Dispatch<SetStateAction<string>>;
  篩選類型: 'all' | 'movie' | 'tv';
  設定篩選類型: Dispatch<SetStateAction<'all' | 'movie' | 'tv'>>;
  搜尋影片: (文字: string, 類型: 'all' | 'movie' | 'tv') => void;
  搜尋中: boolean;
}

export function SearchInputSection({
  關鍵字,
  設定關鍵字,
  篩選類型,
  設定篩選類型,
  搜尋影片,
  搜尋中,
}: Props) {
  return (
    <div className="sticky top-16 z-20 mb-6 border-b border-zinc-700 bg-zinc-900/80 backdrop-blur-md">
      <div className="relative px-4 py-3 sm:px-6">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <Input
            name="search"
            className="h-10 border-zinc-700 bg-zinc-800 pl-4 text-white"
            placeholder="輸入名稱"
            value={關鍵字}
            onChange={(e) => 設定關鍵字(e.target.value)}
          />
          <Select
            value={篩選類型}
            onValueChange={(value: 'all' | 'movie' | 'tv') => {
              設定篩選類型(value);
              搜尋影片(關鍵字, value);
            }}
            disabled={!關鍵字.trim() || 搜尋中}
          >
            <SelectTrigger
              className={cn(
                'h-10 px-3 w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded transition-opacity',
                !關鍵字.trim() || 搜尋中 ? 'opacity-50 cursor-not-allowed' : '',
              )}
            >
              <SelectValue placeholder="選擇分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="movie">電影</SelectItem>
              <SelectItem value="tv">影集</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
