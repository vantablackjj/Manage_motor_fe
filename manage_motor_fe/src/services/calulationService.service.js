// src/services/calculation.service.js
// Business calculation logic

class CalculationService {
  // ===== DON HANG / HOA DON CALCULATIONS =====

  calculateLineTotal(soLuong, donGia) {
    if (!soLuong || !donGia) return 0;
    return soLuong * donGia;
  }

  calculateSubtotal(chiTietList) {
    if (!Array.isArray(chiTietList)) return 0;
    
    return chiTietList.reduce((sum, item) => {
      const lineTotal = this.calculateLineTotal(item.so_luong, item.don_gia);
      return sum + lineTotal;
    }, 0);
  }

  calculateVAT(subtotal, vatRate = 0) {
    if (!subtotal || !vatRate) return 0;
    return subtotal * (vatRate / 100);
  }

  calculateDiscount(subtotal, discountRate = 0, discountAmount = 0) {
    if (discountAmount > 0) return discountAmount;
    if (discountRate > 0) return subtotal * (discountRate / 100);
    return 0;
  }

  calculateTotal(subtotal, vatAmount = 0, discountAmount = 0) {
    return subtotal + vatAmount - discountAmount;
  }

  calculateDonHangTotal(chiTietList, vatRate = 0, discountRate = 0, discountAmount = 0) {
    const subtotal = this.calculateSubtotal(chiTietList);
    const vatAmount = this.calculateVAT(subtotal, vatRate);
    const discount = this.calculateDiscount(subtotal, discountRate, discountAmount);
    const total = this.calculateTotal(subtotal, vatAmount, discount);

    return {
      subtotal,
      vatAmount,
      discountAmount: discount,
      total
    };
  }

  // ===== PROFIT CALCULATIONS =====

  calculateProfit(giaBan, giaNhap, soLuong = 1) {
    if (!giaBan || !giaNhap) return 0;
    return (giaBan - giaNhap) * soLuong;
  }

  calculateProfitMargin(giaBan, giaNhap) {
    if (!giaBan || !giaNhap || giaNhap === 0) return 0;
    return ((giaBan - giaNhap) / giaNhap) * 100;
  }

  calculateGrossProfitMargin(giaBan, giaNhap) {
    if (!giaBan || giaBan === 0) return 0;
    return ((giaBan - giaNhap) / giaBan) * 100;
  }

  calculateTotalProfit(chiTietList) {
    if (!Array.isArray(chiTietList)) return 0;
    
    return chiTietList.reduce((sum, item) => {
      const profit = this.calculateProfit(
        item.gia_ban || item.don_gia,
        item.gia_nhap,
        item.so_luong
      );
      return sum + profit;
    }, 0);
  }

  // ===== INVENTORY CALCULATIONS =====

  calculateStockValue(soLuong, giaNhap) {
    if (!soLuong || !giaNhap) return 0;
    return soLuong * giaNhap;
  }

  calculateTotalStockValue(inventoryList) {
    if (!Array.isArray(inventoryList)) return 0;
    
    return inventoryList.reduce((sum, item) => {
      const value = this.calculateStockValue(item.so_luong_ton, item.gia_nhap);
      return sum + value;
    }, 0);
  }

  calculateAvailableStock(soLuongTon, soLuongKhoa = 0) {
    return Math.max(0, soLuongTon - soLuongKhoa);
  }

  calculateStockTurnover(costOfGoodsSold, averageInventory) {
    if (!averageInventory || averageInventory === 0) return 0;
    return costOfGoodsSold / averageInventory;
  }

  calculateDaysInventoryOutstanding(inventoryTurnover) {
    if (!inventoryTurnover || inventoryTurnover === 0) return 0;
    return 365 / inventoryTurnover;
  }

  // ===== DEBT CALCULATIONS =====

  calculateDebtBalance(tongNo, daTra) {
    return Math.max(0, tongNo - daTra);
  }

  calculateDebtPercentage(daTra, tongNo) {
    if (!tongNo || tongNo === 0) return 0;
    return (daTra / tongNo) * 100;
  }

  calculateOverdueDays(hanThanhToan) {
    if (!hanThanhToan) return 0;
    
    const dueDate = new Date(hanThanhToan);
    const today = new Date();
    
    if (dueDate >= today) return 0;
    
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // ===== REVENUE CALCULATIONS =====

  calculateRevenue(chiTietList) {
    return this.calculateSubtotal(chiTietList);
  }

  calculateAverageOrderValue(totalRevenue, numberOfOrders) {
    if (!numberOfOrders || numberOfOrders === 0) return 0;
    return totalRevenue / numberOfOrders;
  }

  calculateGrowthRate(currentValue, previousValue) {
    if (!previousValue || previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  }

  // ===== PERCENTAGE CALCULATIONS =====

  calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return (value / total) * 100;
  }

  calculatePercentageChange(oldValue, newValue) {
    if (!oldValue || oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  // ===== TAX CALCULATIONS =====

  calculateTaxableAmount(amount, vatRate) {
    // Amount includes VAT, calculate base amount
    if (!amount || !vatRate) return amount;
    return amount / (1 + vatRate / 100);
  }

  calculateTaxFromTotal(totalAmount, vatRate) {
    const taxableAmount = this.calculateTaxableAmount(totalAmount, vatRate);
    return totalAmount - taxableAmount;
  }

  // ===== PAYMENT CALCULATIONS =====

  calculateInstallment(principal, monthlyRate, months) {
    if (!principal || !monthlyRate || !months) return 0;
    
    const rate = monthlyRate / 100;
    const numerator = principal * rate * Math.pow(1 + rate, months);
    const denominator = Math.pow(1 + rate, months) - 1;
    
    return numerator / denominator;
  }

  calculateTotalInterest(monthlyPayment, months, principal) {
    return (monthlyPayment * months) - principal;
  }

  // ===== STATISTICAL CALCULATIONS =====

  calculateAverage(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
  }

  calculateMedian(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    return sorted[mid];
  }

  calculateSum(numbers) {
    if (!Array.isArray(numbers)) return 0;
    return numbers.reduce((sum, val) => sum + val, 0);
  }

  calculateMin(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    return Math.min(...numbers);
  }

  calculateMax(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    return Math.max(...numbers);
  }

  // ===== RATIO CALCULATIONS =====

  calculateReturnOnInvestment(gain, cost) {
    if (!cost || cost === 0) return 0;
    return ((gain - cost) / cost) * 100;
  }

  calculateBreakEvenPoint(fixedCosts, pricePerUnit, variableCostPerUnit) {
    const contribution = pricePerUnit - variableCostPerUnit;
    if (contribution === 0) return 0;
    return fixedCosts / contribution;
  }

  // ===== WAREHOUSE TRANSFER CALCULATIONS =====

  calculateTransferValue(xeList, phuTungList) {
    let total = 0;

    // Calculate xe value
    if (Array.isArray(xeList)) {
      total += xeList.reduce((sum, xe) => {
        return sum + (xe.gia_tri_chuyen_kho || xe.gia_nhap || 0);
      }, 0);
    }

    // Calculate phu tung value
    if (Array.isArray(phuTungList)) {
      total += phuTungList.reduce((sum, pt) => {
        return sum + (pt.so_luong * pt.don_gia || 0);
      }, 0);
    }

    return total;
  }

  // ===== ROUNDING =====

  roundToDecimal(number, decimals = 2) {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  roundToCurrency(amount) {
    return Math.round(amount);
  }

  // ===== AGGREGATION =====

  groupByAndSum(items, groupKey, sumKey) {
    if (!Array.isArray(items)) return {};

    return items.reduce((result, item) => {
      const key = item[groupKey];
      if (!result[key]) {
        result[key] = 0;
      }
      result[key] += item[sumKey] || 0;
      return result;
    }, {});
  }

  aggregateByPeriod(items, dateKey, valueKey, period = 'month') {
    if (!Array.isArray(items)) return {};

    return items.reduce((result, item) => {
      const date = new Date(item[dateKey]);
      let key;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString();
      }

      if (!result[key]) {
        result[key] = 0;
      }
      result[key] += item[valueKey] || 0;
      return result;
    }, {});
  }
}

export default new CalculationService();