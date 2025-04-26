Program Generate;

Const 
  MMAX = 10;
  NMAX = 10;
  TMAX = 10;
  IMAX = 50;

Var 
  Iter, Inter: integer;
  M: array [1..IMAX] of integer;
  N: array [1..IMAX] of integer;
  i, j, k, l: integer;
  A: array [1..TMAX, 1..MMAX, 1..NMAX] of double;
  C: array [1..NMAX] of double;
  DN: array [1..NMAX] of double;
  DV: array [1..NMAX] of double;
  DEL: array [1..NMAX] of double;
  BN: array [1..MMAX] of double;
  BV: array [1..MMAX] of double;
  Y: array [1..MMAX] of double;
  X: array [1..NMAX] of double;
  AX: array [1..MMAX] of double;
  DB: array [1..MMAX] of double;
  CX: double;
  fo: text;
  buf, buff: string;

Function Rand1(rfrom, rto: double): double;
Var 
  d: double;
  i: integer;
Begin
  d := random;
  d := rfrom + d * (rto - rfrom);
  i := Round(d * 10);
  d := i;
  Rand1 := d / 10;
End;

Function MaxX(val: array of double; size: integer): double;
Var 
  max_val: double;
  i: integer;
Begin
  max_val := val[1];
  for i := 1 to size do
  begin
    if val[i] >= max_val then
      max_val := val[i];
  end;
  MaxX := max_val;
End;

Function MinX(val: array of double; size: integer): double;
Var 
  min_val: double;
  i: integer;
Begin
  min_val := val[1];
  for i := 1 to size do
  begin
    if val[i] <= min_val then
      min_val := val[i];
  end;
  MinX := min_val;
End;

Begin
  Write('Vvedite chislo vremennyh intervalov = ');
  readln(Inter);
  Write('Vvedite chislo reshaemyh zadach = ');
  readln(Iter);
  
  for l := 1 to Inter do
  begin
    writeln('Vremennoy interval #', l);
    
    for k := 1 to Iter do
    begin
      Randomize;
      str(l, buff);
      str(k, buf);
      assign(fo, 'out_' + buff + '_' + buf + '.txt');
      rewrite(fo);
      
      if l = 1 then
      begin
        Writeln('Vvedite razmernost zadachi #', k);
        
        If k = 1 then
        begin
          Write('N=');
          readln(N[k]);
        end
        else
        begin
          N[k] := M[k-1];
        end;
        
        Write('M=');
        readln(M[k]);
        writeln(fo, N[k]:2, '<==N');
        writeln(fo, M[k]:2, '<==M');
        
        if (N[k] > NMAX) or (M[k] > MMAX) then
        begin
          Writeln('Too big dimensions!');
          Exit;
        end;
      end; {if l=1 interval}
      
      if k = 1 then
      begin
        Writeln('Vvedite plan');
        for j := 1 to N[k] do
        begin
          Write('X[', j, ']=');
          readln(X[j]);
        end;
      end;
      
      if (k > 1) and (l > 1) then
      begin
        Writeln('Vvedite deltaB');
        for i := 1 to M[k] do
        begin
          Writeln('Vvedite dB dlya zadachi #', k);
          Write('dB[', i, ']=');
          readln(DB[i]);
        end;
      end;
      
      for j := 1 to N[k] do
      begin
        if k = 1 then
        begin
          if X[j] < (MinX(X, N[k]) + 0.35 * (MaxX(X, N[k]) - MinX(X, N[k]))) then
          begin
            DN[j] := X[j];
            DV[j] := MaxX(X, N[k]);
            DEL[j] := Rand1(DN[j] + 0.25 * (DV[j] - DN[j]), DN[j] + 0.45 * (DV[j] - DN[j]));
          end;
          
          if (X[j] >= (MinX(X, N[k]) + 0.35 * (MaxX(X, N[k]) - MinX(X, N[k]))))
          AND (X[j] <= (MinX(X, N[k]) + 0.65 * (MaxX(X, N[k]) - MinX(X, N[k])))) then
          begin
            DN[j] := MinX(X, N[k]);
            DV[j] := MaxX(X, N[k]);
            DEL[j] := (MaxX(X, N[k]) - MinX(X, N[k])) / 2;
          end;
          
          if X[j] > (MinX(X, N[k]) + 0.65 * (MaxX(X, N[k]) - MinX(X, N[k]))) then
          begin
            DN[j] := MinX(X, N[k]);
            DV[j] := X[j];
            DEL[j] := Rand1(DN[j] + 0.55 * (DV[j] - DN[j]), DN[j] + 0.75 * (DV[j] - DN[j]));
          end;
        end
        else
        begin {if k=1 end}
          DN[j] := BN[j];
          DV[j] := BV[j];
          X[j] := AX[j] + DB[j];
          
          if X[j] < (DN[j] + 0.35 * (DV[j] - DN[j])) then
          begin
            DEL[j] := Rand1(DN[j] + 0.25 * (DV[j] - DN[j]), DN[j] + 0.45 * (DV[j] - DN[j]));
          end;
          
          if (X[j] >= (DN[j] + 0.35 * (DV[j] - DN[j])))
          AND (X[j] <= (DN[j] + 0.65 * (DV[j] - DN[j]))) then
          begin
            DEL[j] := (DN[j] + DV[j]) / 2;
          end;
          
          if X[j] > (DN[j] + 0.65 * (DV[j] - DN[j])) then
          begin
            DEL[j] := Rand1(DN[j] + 0.55 * (DV[j] - DN[j]), DN[j] + 0.75 * (DV[j] - DN[j]));
          end;
        end; {if k!=1 end}
      end;
      
      if l = 1 then
      begin
        Writeln('Vvedite matricu A');
        for i := 1 to M[k] do
        begin
          AX[i] := 0;
          for j := 1 to N[k] do
          begin
            Write('A[', i, ',', j, ']=');
            readln(A[k,i,j]);
            AX[i] := AX[i] + A[k,i,j] * X[j];
          end;
        end;
      end
      else
      begin
        for i := 1 to M[k] do
        begin
          AX[i] := 0;
          for j := 1 to N[k] do
          begin
            AX[i] := AX[i] + A[k,i,j] * X[j];
          end;
        end;
      end; {if l!=1 end}
      
      for i := 1 to M[k] do
      begin
        if AX[i] < (MinX(AX, M[k]) + 0.35 * (MaxX(AX, M[k]) - MinX(AX, M[k]))) then
        begin
          BN[i] := AX[i];
          BV[i] := MaxX(AX, M[k]);
          Y[i] := Rand1(BN[i] + 0.25 * (BV[i] - BN[i]), BN[i] + 0.45 * (BV[i] - BN[i]));
        end;
        
        if (AX[i] >= (MinX(AX, M[k]) + 0.35 * (MaxX(AX, M[k]) - MinX(AX, M[k]))))
        AND (AX[i] <= (MinX(AX, M[k]) + 0.65 * (MaxX(AX, M[k]) - MinX(AX, M[k])))) then
        begin
          BN[i] := MinX(AX, M[k]);
          BV[i] := MaxX(AX, M[k]);
          Y[i] := (MaxX(AX, M[k]) - MinX(AX, M[k])) / 2;
        end;
        
        if AX[i] > (MinX(AX, M[k]) + 0.65 * (MaxX(AX, M[k]) - MinX(AX, M[k]))) then
        begin
          BN[i] := MinX(AX, M[k]);
          BV[i] := AX[i];
          Y[i] := Rand1(BN[i] + 0.55 * (BV[i] - BN[i]), BN[i] + 0.75 * (BV[i] - BN[i]));
        end;
      end;
      
      CX := 0;
      for j := 1 to N[k] do
      begin
        C[j] := DEL[j];
        for i := 1 to M[k] do
          C[j] := C[j] + A[k,i,j] * Y[i];
        CX := CX + C[j] * X[j];
      end;
      
      writeln(fo, 'C, CX=', CX:6:2);
      for j := 1 to N[k] do
        Write(fo, C[j]:6:2, ' ');
      Writeln(fo);
      
      writeln(fo, 'DN');
      for j := 1 to N[k] do
        Write(fo, DN[j]:6:2, ' ');
      Writeln(fo);
      
      writeln(fo, 'DV');
      for j := 1 to N[k] do
        Write(fo, DV[j]:6:2, ' ');
      Writeln(fo);
      
      writeln(fo, 'BN');
      for i := 1 to M[k] do
        Write(fo, BN[i]:6:2, ' ');
      Writeln(fo);
      
      writeln(fo, 'BV');
      for i := 1 to M[k] do
        Write(fo, BV[i]:6:2, ' ');
      Writeln(fo);
      
      writeln(fo, 'A');
      for i := 1 to M[k] do
      begin
        for j := 1 to N[k] do
          Write(fo, A[k,i,j]:6:2, ' ');
        Writeln(fo);
      end;
      
      writeln(fo, 'X');
      for j := 1 to N[k] do
        Write(fo, DV[j]:6:2, ' ');
      Writeln(fo);
      
      writeln(fo, 'Xopt');
      for j := 1 to N[k] do
        Write(fo, X[j]:6:2, ' ');
      Writeln(fo);
      
      writeln(fo, 'B');
      for i := 1 to M[k] do
        Write(fo, AX[i]:6:2, ' ');
      Writeln(fo);
      
      close(fo);
      writeln;
    end; {Iteration}
  end; {Interval}
End. 